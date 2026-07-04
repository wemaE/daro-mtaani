import { supabase } from '../supabase';

export interface HubPublic {
  id: string;
  name: string;
  location: any;
  assets: string[];
  capacity: number;
  current_occupancy: number;
  settlement: string;
  over_capacity: boolean;
  distance_meters?: number;
}

export async function guardianRoute(landmarkCode: string, requiredAssets: string[]): Promise<HubPublic[]> {
  const { data, error } = await supabase.rpc('route_hubs', {
    p_landmark_code: landmarkCode,
    p_required_assets: requiredAssets
  });

  if (error) {
    // Fallback if RPC fails or in mock test environment
    const { data: landmark } = await supabase.from('landmarks').select('*').eq('code', landmarkCode).maybeSingle();
    const { data: hubs } = await supabase.from('hubs').select('*');
    if (!landmark || !hubs) return [];

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

    let lLat = 0, lLng = 0;
    if (landmark.approx_location) {
      if (typeof landmark.approx_location === 'object' && landmark.approx_location.coordinates) {
        lLng = landmark.approx_location.coordinates[0];
        lLat = landmark.approx_location.coordinates[1];
      } else if (typeof landmark.approx_location === 'string') {
        // Handle Point(lng lat) string representation
        const matches = landmark.approx_location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
        if (matches) {
          lLng = parseFloat(matches[1]);
          lLat = parseFloat(matches[2]);
        }
      }
    }

    const filtered = (hubs || [])
      .filter((h: any) => {
        if (h.over_capacity) return false;
        if (requiredAssets && requiredAssets.length > 0) {
          return requiredAssets.every((val: string) => h.assets && h.assets.includes(val));
        }
        return true;
      })
      .map((h: any) => {
        let hLng = 0, hLat = 0;
        if (h.location) {
          if (typeof h.location === 'object' && h.location.coordinates) {
            hLng = h.location.coordinates[0];
            hLat = h.location.coordinates[1];
          } else if (typeof h.location === 'string') {
            const matches = h.location.match(/POINT\((%d.) (%d.)\)/i);
            if (matches) {
              hLng = parseFloat(matches[1]);
              hLat = parseFloat(matches[2]);
            }
          }
        }
        const dist = getDistance(lLat, lLng, hLat, hLng);
        return { ...h, distance_meters: dist };
      })
      .filter((h: any) => h.distance_meters <= 3000)
      .sort((a: any, b: any) => a.distance_meters - b.distance_meters);

    return filtered;
  }

  return data || [];
}

export async function guardianResortQueue(settlement: string): Promise<string[]> {
  const { data: households, error } = await supabase
    .from('households')
    .select('id')
    .eq('settlement', settlement)
    .order('ups_score', { ascending: false });

  if (error || !households) {
    return [];
  }

  return households.map(h => h.id);
}

export interface DispatchItem {
  id: string;
  studentName: string;
  upsScore: number;
  landmarkCode: string;
}

export function guardianFilterAndRoute(hubs: any[], queue: DispatchItem[]) {
  const routedHubs = hubs.filter(hub => hub.capacityStatus < 80);
  const sortedQueue = [...queue].sort((a, b) => b.upsScore - a.upsScore);
  return {
    routedHubs,
    queue: sortedQueue
  };
}

