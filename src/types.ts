/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tutor {
  id: string;
  name: string;
  experienceYears: number;
  subjects: string[];
  languages: string[];
  location: string; // Settlement e.g. "Kibera", "Mathare"
  distanceKm: number;
  availability: string[]; // e.g. ["Mon PM", "Sat AM"]
  rating: number;
  bio: string;
  avatarSeed: string;
  phone: string;
  status: 'available' | 'busy';
  ubuntuScorePref: number; // Tutors prioritizing high UPS
}

export interface Hub {
  id: string;
  name: string;
  settlement: 'Kibera' | 'Mathare' | 'Mukuru' | 'Kawangware';
  capacityStatus: number; // 0-100 %
  maxCapacity: number;
  currentCapacity: number;
  availableAssets: string[]; // e.g., ["WiFi", "Tablets", "Electricity"]
  walkingDistanceMins: number;
  coords: { lat: number; lng: number };
}

export interface UbuntuScore {
  timePoverty: number; // 0-10
  materialDeficit: number; // 0-10
  examRisk: number; // 0-10
  disabilitySupport: number; // 0-10
  householdPressure: number; // 0-10
  score: number; // computed
  priorityTier: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
}

export interface HelpRequest {
  id: string;
  studentName: string;
  requestType: 'Mathematics' | 'Science' | 'CBC Project' | 'WiFi Access' | 'Device Access' | 'Mentorship';
  description: string;
  location: string; // e.g. "Mathare Sector 4"
  settlement: 'Kibera' | 'Mathare' | 'Mukuru' | 'Kawangware';
  parentName: string;
  parentContact: string;
  ubuntuScore: number;
  status: 'pending' | 'assigned' | 'completed';
  createdAt: string;
  assignedHubId?: string;
  assignedTutorId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  progress: number; // 0-100
  requirements: string[];
  certificateUnlocked: boolean;
  hoursRequired: number;
  studentsImpactedRequired: number;
}

export interface CbcTerm {
  term: string;
  swahiliTranslation: string;
  shengTranslation: string;
  definitionEn: string;
  definitionSw: string;
  definitionSheng: string;
  examples: string[];
  readingGuide: string;
}

export interface ImpactMetrics {
  studentsServed: number;
  tutorsActive: number;
  volunteerHours: number;
  learningHubsActive: number;
  sessionsCompleted: number;
}
