export interface Landmark {
  code: string;
  name: string;
  settlement: 'Mathare' | 'Kibera' | 'Mukuru' | 'Kawangware';
  description: string;
  // Approximate offset coordinates for spatial calculations (within 1km proxy)
  lat: number;
  lng: number;
}

export const LANDMARKS: Landmark[] = [
  // Mathare
  { code: "MTH-CHIEF", name: "Chief's Office Area", settlement: "Mathare", description: "Near Mathare Chief's Camp", lat: -1.2588, lng: 36.8584 },
  { code: "MTH-STAGE10", name: "Stage 10 Bus Stop", settlement: "Mathare", description: "Main transit access point in Mathare", lat: -1.2612, lng: 36.8621 },
  { code: "MTH-BRIDGE", name: "Mathare River Bridge", settlement: "Mathare", description: "Connecting sectors across the river", lat: -1.2595, lng: 36.8602 },
  
  // Kibera
  { code: "KBR-SOWETO", name: "Soweto East Community Hall", settlement: "Kibera", description: "Active resource zone in Soweto East", lat: -1.3150, lng: 36.7880 },
  { code: "KBR-OLYMPIC", name: "Olympic Primary Area", settlement: "Kibera", description: "Near Olympic School and Hubs", lat: -1.3120, lng: 36.7905 },
  { code: "KBR-KAMEERA", name: "Kameera Stage", settlement: "Kibera", description: "Commercial node on the Kibera grid", lat: -1.3142, lng: 36.7851 },

  // Mukuru
  { code: "MKR-RUBEN", name: "Ruben Centre Landmark", settlement: "Mukuru", description: "Ruben primary resource landmark", lat: -1.3205, lng: 36.8785 },
  { code: "MKR-STAGE", name: "Mukuru Stage", settlement: "Mukuru", description: "Mukuru Kwa Njenga central stage", lat: -1.3218, lng: 36.8812 },

  // Kawangware
  { code: "KWG-CONGO", name: "Congo Stage Area", settlement: "Kawangware", description: "Congo stage junction", lat: -1.2885, lng: 36.7456 },
  { code: "KWG-BP", name: "BP Station Stage", settlement: "Kawangware", description: "Main entry terminal in Kawangware", lat: -1.2862, lng: 36.7490 }
];

export function getLandmarkByCode(code: string): Landmark | undefined {
  return LANDMARKS.find(l => l.code === code);
}

export function getLandmarksBySettlement(settlement: string): Landmark[] {
  return LANDMARKS.filter(l => l.settlement === settlement);
}
