import { Tutor } from '../../types';

interface CacheEntry {
  timestamp: number;
  data: any;
}

const scoutCache: { [key: string]: CacheEntry } = {};
const invocationHistory: { [householdId: string]: number[] } = {};

export interface MatchResult {
  tutorShortlist: Tutor[];
  cbcStrandMatch: string;
  source: 'live' | 'cache_fallback';
}

export function scoutAcademicMatch(
  householdId: string,
  subject: string,
  allTutors: Tutor[]
): MatchResult {
  const now = Date.now();
  
  // Rate limiting check: max 3/day per household
  const todayHistory = (invocationHistory[householdId] || []).filter(
    t => now - t < 24 * 60 * 60 * 1000
  );
  
  if (todayHistory.length >= 3) {
    throw new Error("Rate limit exceeded: scout is limited to 3 matching runs per day per household.");
  }
  
  // Log current invocation
  todayHistory.push(now);
  invocationHistory[householdId] = todayHistory;

  // Cache check for cold state fallback: 30 minutes (1800000 ms)
  const cacheKey = `${householdId}-${subject}`;
  const cached = scoutCache[cacheKey];
  const isColdState = cached && (now - cached.timestamp > 30 * 60 * 1000);

  if (isColdState) {
    return {
      tutorShortlist: cached.data.tutors,
      cbcStrandMatch: cached.data.cbcStrand,
      source: 'cache_fallback'
    };
  }

  // Live matching logic
  const filteredTutors = allTutors
    .filter(t => t.subjects.includes(subject))
    .slice(0, 3);

  const cbcStrandMatch = `CBC Strand Match for ${subject}: Foundational competencies level alignment`;

  // Update Cache
  scoutCache[cacheKey] = {
    timestamp: now,
    data: { tutors: filteredTutors, cbcStrand: cbcStrandMatch }
  };

  return {
    tutorShortlist: filteredTutors,
    cbcStrandMatch,
    source: 'live'
  };
}
