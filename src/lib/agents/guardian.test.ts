import { guardianFilterAndRoute, DispatchItem } from './guardian';
import { Hub } from '../../types';

// Mock Hubs data
const mockHubs: Hub[] = [
  {
    id: "hub-1",
    name: "SHOFCO Kibera Hub",
    location: "Kibera Sector 1",
    settlement: "Kibera",
    capacityStatus: 50, // 50% capacity (should be allowed)
    maxCapacity: 100,
    currentCapacity: 50,
    availableAssets: ["WiFi"],
    walkingDistanceMins: 5
  },
  {
    id: "hub-2",
    name: "Mukuru Ruben Centre",
    location: "Mukuru Ruben",
    settlement: "Mukuru",
    capacityStatus: 80, // 80% capacity (should be BLOCKED)
    maxCapacity: 100,
    currentCapacity: 80,
    availableAssets: ["Tablets"],
    walkingDistanceMins: 10
  },
  {
    id: "hub-3",
    name: "Mathare Youth Center",
    location: "Mathare Stage 10",
    settlement: "Mathare",
    capacityStatus: 95, // 95% capacity (should be BLOCKED)
    maxCapacity: 100,
    currentCapacity: 95,
    availableAssets: ["Solar"],
    walkingDistanceMins: 15
  }
];

const mockQueue: DispatchItem[] = [
  { id: "s1", studentName: "Student A", upsScore: 5.5, landmarkCode: "MTH-STAGE10" },
  { id: "s2", studentName: "Student B", upsScore: 9.0, landmarkCode: "KBR-SOWETO" }
];

function runTest() {
  console.log("Running Guardian Agent Unit Test...");
  
  const result = guardianFilterAndRoute(mockHubs, mockQueue);

  // Assertion 1: Hubs with status >= 80% must be omitted
  const hasOverloadedHubs = result.routedHubs.some(hub => hub.capacityStatus >= 80);
  if (hasOverloadedHubs) {
    console.error("FAIL: Guardian agent returned a hub at or above 80% capacity status!");
    process.exit(1);
  } else {
    console.log("PASS: Guardian agent successfully filtered out hubs with capacity >= 80%.");
  }

  // Assertion 2: Queue should be sorted descending by UPS score
  if (result.queue[0].upsScore !== 9.0 || result.queue[1].upsScore !== 5.5) {
    console.error("FAIL: Dispatch queue is not sorted by UPS score descending!");
    process.exit(1);
  } else {
    console.log("PASS: Queue successfully sorted by UPS score descending.");
  }

  console.log("All Guardian tests passed successfully.");
}

runTest();
