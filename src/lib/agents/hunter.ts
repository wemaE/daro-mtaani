import { Landmark } from '../landmarks';

export interface HunterMatchParams {
  tutorLandmark: Landmark;
  studentLandmark: Landmark;
  hubLandmark: Landmark;
  elderApprovalPin: string | null;
  scheduledAt: string;
}

export function hunterFinalizeMatch(params: HunterMatchParams) {
  const { tutorLandmark, studentLandmark, hubLandmark, elderApprovalPin, scheduledAt } = params;

  // 1. PIN Enforcement
  if (!elderApprovalPin || elderApprovalPin.trim() === "") {
    return {
      success: false,
      error: "BLOCK: Session confirmation requires a valid Elders Council approval PIN."
    };
  }

  // 2. Proximity check (1km limit)
  // Simple haversine function to compute distance in km
  const getDistance = (l1: Landmark, l2: Landmark) => {
    const R = 6371; // Earth radius in km
    const dLat = (l2.lat - l1.lat) * Math.PI / 180;
    const dLng = (l2.lng - l1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distTutorToStudent = getDistance(tutorLandmark, studentLandmark);
  const distTutorToHub = getDistance(tutorLandmark, hubLandmark);

  if (distTutorToStudent > 1.0 && distTutorToHub > 1.0) {
    return {
      success: false,
      error: `BLOCK: Proximity constraint violation. Tutor is located too far (>1km) from both student landmark (${distTutorToStudent.toFixed(2)}km) and hub landmark (${distTutorToHub.toFixed(2)}km).`
    };
  }

  // 3. Emit <0.2KB success payload
  const payload = {
    ok: true,
    pin: elderApprovalPin,
    time: scheduledAt
  };

  return {
    success: true,
    payload
  };
}
