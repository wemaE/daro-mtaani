import { supabase } from '../supabase';

export interface HunterResult {
  status: 'pending_elder_approval' | 'confirmed' | 'failed';
  error?: string;
  payload?: {
    ok: boolean;
    tutorId: string;
    sessionId?: string;
    when: string;
  };
}

export async function hunterMatch(
  studentId: string,
  tutorId: string,
  elderApprovalPin?: string,
  scheduledAt: string = new Date().toISOString()
): Promise<HunterResult> {
  // 1. Fetch tutor
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', tutorId)
    .single();

  if (tutorError || !tutor) {
    return { status: 'failed', error: 'Tutor not found.' };
  }

  // CRITICAL: Filter candidate tutors - must be verified by elder
  if (!tutor.verified_by_elder) {
    return { status: 'failed', error: 'BLOCK: Tutor is not verified by an elder.' };
  }

  // 2. Fetch student and household
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, households(*)')
    .eq('id', studentId)
    .single();

  if (studentError || !student || !student.households) {
    return { status: 'failed', error: 'Student or household not found.' };
  }

  const landmarkCode = (student.households as any).landmark_code;
  const { data: landmark, error: landmarkError } = await supabase
    .from('landmarks')
    .select('*')
    .eq('code', landmarkCode)
    .single();

  if (landmarkError || !landmark) {
    return { status: 'failed', error: 'Landmark not found.' };
  }

  // 3. Proximity check (1km proximity)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in metres
  };

  let tLng = 0, tLat = 0;
  if (tutor.location) {
    if (typeof tutor.location === 'object' && tutor.location.coordinates) {
      tLng = tutor.location.coordinates[0];
      tLat = tutor.location.coordinates[1];
    } else if (typeof tutor.location === 'string') {
      const matches = tutor.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
      if (matches) {
        tLng = parseFloat(matches[1]);
        tLat = parseFloat(matches[2]);
      }
    }
  }

  let lLng = 0, lLat = 0;
  if (landmark.approx_location) {
    if (typeof landmark.approx_location === 'object' && landmark.approx_location.coordinates) {
      lLng = landmark.approx_location.coordinates[0];
      lLat = landmark.approx_location.coordinates[1];
    } else if (typeof landmark.approx_location === 'string') {
      const matches = landmark.approx_location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
      if (matches) {
        lLng = parseFloat(matches[1]);
        lLat = parseFloat(matches[2]);
      }
    }
  }

  const distance = getDistance(tLat, tLng, lLat, lLng);
  if (distance > 1000) {
    return {
      status: 'failed',
      error: `BLOCK: Proximity constraint violation. Tutor is located too far (>1km) from student landmark (${(distance / 1000).toFixed(2)}km).`
    };
  }

  // 4. Pin validation
  if (!elderApprovalPin || elderApprovalPin.trim() === '') {
    return { status: 'pending_elder_approval' };
  }

  // Insert session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      student_id: studentId,
      tutor_id: tutorId,
      scheduled_at: scheduledAt,
      status: 'confirmed',
      elder_approval_pin: elderApprovalPin,
      cbc_topic: student.cbc_strands?.[0] || 'General Studies'
    })
    .select()
    .single();

  if (sessionError || !session) {
    return { status: 'failed', error: `Failed to create session: ${sessionError?.message || ''}` };
  }

  // Return a compressed payload object under 0.2KB
  return {
    status: 'confirmed',
    payload: {
      ok: true,
      tutorId: tutorId,
      sessionId: session.id,
      when: scheduledAt
    }
  };
}

export { hunterMatch as hunterFinalizeMatch };

