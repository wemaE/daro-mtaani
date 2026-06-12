import { Hub } from '../../types';

export interface DispatchItem {
  id: string;
  studentName: string;
  upsScore: number;
  landmarkCode: string;
}

export function guardianFilterAndRoute(
  hubs: Hub[],
  dispatchQueue: DispatchItem[],
  maxCapacityPercentage: number = 80
): { routedHubs: Hub[]; queue: DispatchItem[] } {
  // Filter out any hub at >=80% capacity status
  const availableHubs = hubs.filter(hub => hub.capacityStatus < maxCapacityPercentage);

  // Sort queue by UPS score descending
  const sortedQueue = [...dispatchQueue].sort((a, b) => b.upsScore - a.upsScore);

  return {
    routedHubs: availableHubs,
    queue: sortedQueue
  };
}
