import { supabase } from '../supabase';

export interface TutorPublic {
  id: string;
  display_name: string;
  institution: string | null;
  subjects: string[];
  rating: number;
  verified_by_elder: boolean;
  verified_by_elder_id: string | null;
  verified_at: string | null;
  badge_level: number;
  ledger: any;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  settlement: string;
}

export interface ScoutMatchResult {
  tutorCandidates: TutorPublic[];
  cbcStrand: string;
  landmarkCode: string;
}

export async function scoutMatch(householdId: string, cbcStrand: string): Promise<ScoutMatchResult> {
  // Fetch household details
  const { data: household, error: hhError } = await supabase
    .from('households')
    .select('settlement, landmark_code')
    .eq('id', householdId)
    .single();

  if (hhError || !household) {
    throw new Error(`Household not found: ${hhError?.message || ''}`);
  }

  const { settlement, landmark_code: landmarkCode } = household;
  const now = new Date();

  // Check scout invocations table for rate limit and caching
  const { data: invoc, error: invocError } = await supabase
    .from('scout_invocations')
    .select('*')
    .eq('household_id', householdId)
    .maybeSingle();

  let invocationsToday = 0;
  let lastActiveAt = new Date(0);
  let cachedResult: ScoutMatchResult | null = null;
  let lastResetAt = now;

  if (invoc) {
    invocationsToday = invoc.invocations_today;
    lastActiveAt = new Date(invoc.last_active_at);
    cachedResult = invoc.cached_result as ScoutMatchResult | null;
    lastResetAt = new Date(invoc.last_reset_at);

    // Reset counter if it's a new day
    const resetDate = new Date(lastResetAt);
    if (
      resetDate.getUTCDate() !== now.getUTCDate() ||
      resetDate.getUTCMonth() !== now.getUTCMonth() ||
      resetDate.getUTCFullYear() !== now.getUTCFullYear()
    ) {
      invocationsToday = 0;
      lastResetAt = now;
    }
  }

  const minutesSinceActive = (now.getTime() - lastActiveAt.getTime()) / (1000 * 60);

  // Cold-state check: serve cached result if last active > 30 minutes
  if (cachedResult && minutesSinceActive > 30) {
    await supabase.from('scout_invocations').upsert({
      household_id: householdId,
      invocations_today: invocationsToday,
      last_active_at: now.toISOString(),
      cached_result: cachedResult,
      last_reset_at: lastResetAt.toISOString()
    });
    return cachedResult;
  }

  // Rate limiting check
  if (invocationsToday >= 3 && cachedResult) {
    await supabase.from('scout_invocations').upsert({
      household_id: householdId,
      invocations_today: invocationsToday,
      last_active_at: now.toISOString(),
      cached_result: cachedResult,
      last_reset_at: lastResetAt.toISOString()
    });
    return cachedResult;
  }

  // Fetch tutor candidates
  const { data: tutors, error: tutorsError } = await supabase
    .from('tutors_public')
    .select('*')
    .eq('settlement', settlement)
    .eq('verified_by_elder', true);

  if (tutorsError) {
    throw new Error(`Failed to fetch tutor candidates: ${tutorsError.message}`);
  }

  const matchedTutors = (tutors || []).filter((t: TutorPublic) =>
    t.subjects.some((sub: string) => cbcStrand.toLowerCase().includes(sub.toLowerCase()))
  );

  const finalCandidates = matchedTutors.length > 0 ? matchedTutors : (tutors || []);
  const tutorCandidates = finalCandidates
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5) as TutorPublic[];

  const result: ScoutMatchResult = {
    tutorCandidates,
    cbcStrand,
    landmarkCode
  };

  // Update scout invocations tracking
  await supabase.from('scout_invocations').upsert({
    household_id: householdId,
    invocations_today: invocationsToday + 1,
    last_active_at: now.toISOString(),
    cached_result: result,
    last_reset_at: lastResetAt.toISOString()
  });

  return result;
}

export { scoutMatch as scoutAcademicMatch };

