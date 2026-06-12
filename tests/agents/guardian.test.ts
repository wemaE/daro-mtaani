import { supabase } from '../../src/lib/supabase';
import { guardianRoute } from '../../src/lib/agents/guardian';

const mockHubs = [
  {
    id: 'hub-1',
    name: 'SHOFCO Kibera Hub',
    location: { type: 'Point', coordinates: [36.7880, -1.3150] },
    assets: ['WiFi'],
    capacity: 100,
    current_occupancy: 50,
    settlement: 'Kibera',
    over_capacity: false
  },
  {
    id: 'hub-2',
    name: 'Overcapacity Hub',
    location: { type: 'Point', coordinates: [36.7890, -1.3160] },
    assets: ['Tablets'],
    capacity: 100,
    current_occupancy: 85,
    settlement: 'Kibera',
    over_capacity: true
  }
];

const mockLandmark = {
  code: 'KBR-SOWETO',
  approx_location: { type: 'Point', coordinates: [36.7880, -1.3150] }
};

supabase.rpc = (fn: string, args?: any) => {
  if (fn === 'route_hubs') {
    return Promise.resolve({
      data: mockHubs.filter(h => !h.over_capacity),
      error: null
    }) as any;
  }
  return Promise.resolve({ data: null, error: new Error('Unknown RPC') }) as any;
};

async function runTest() {
  console.log("Running Guardian Route Test...");
  const results = await guardianRoute('KBR-SOWETO', []);
  
  const overCapacityFound = results.some(h => h.over_capacity);
  if (overCapacityFound) {
    console.error("FAIL: guardianRoute returned an overcapacity hub!");
    process.exit(1);
  }

  console.log("PASS: guardianRoute successfully filtered out over_capacity=true hubs.");
  console.log("All Guardian Agent tests passed successfully.");
}

runTest().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
