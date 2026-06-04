/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tutor, Hub, CbcTerm, Badge, HelpRequest, ImpactMetrics } from '../types';

export const PARTNERS = [
  { name: "SHOFCO", role: "Grassroots Hub Coordination", logoText: "S" },
  { name: "Safaricom Foundation", role: "Connectivity Partner", logoText: "SF" },
  { name: "Ruben Centre", role: "Mukuru Hub Host", logoText: "RC" },
  { name: "UNICEF Kenya", role: "STEM Kits & Resource Provider", logoText: "U" },
  { name: "Mathare Youth Sports Association", role: "Mtaani Space Partner", logoText: "M" }
];

export const MOCK_TUTORS: Tutor[] = [
  {
    id: "tut-1",
    name: "Amina Omondi",
    experienceYears: 4,
    subjects: ["Mathematics", "CBC Project", "Science"],
    languages: ["Swahili", "English", "Sheng"],
    location: "Kibera",
    distanceKm: 0.6,
    availability: ["Monday PM", "Saturday AM", "Wednesday PM"],
    rating: 4.9,
    bio: "Dedicated science educator passionate about breaking down STEM principles using locally sourced, household recycled items.",
    avatarSeed: "amina",
    phone: "+254 712 345678",
    status: "available",
    ubuntuScorePref: 6
  },
  {
    id: "tut-2",
    name: "John Mwangi",
    experienceYears: 2,
    subjects: ["Science", "Mentorship"],
    languages: ["English", "Swahili"],
    location: "Mathare",
    distanceKm: 1.1,
    availability: ["Saturday AM", "Sunday PM"],
    rating: 4.8,
    bio: "Computer engineering undergraduate at UON. I love tutoring kids on foundational coding concepts and science experiments.",
    avatarSeed: "john",
    phone: "+254 723 456789",
    status: "available",
    ubuntuScorePref: 4
  },
  {
    id: "tut-3",
    name: "Grace Kendi",
    experienceYears: 6,
    subjects: ["Mathematics", "Science"],
    languages: ["Swahili", "English"],
    location: "Mukuru",
    distanceKm: 0.4,
    availability: ["Tuesday PM", "Thursday PM", "Saturday PM"],
    rating: 5.0,
    bio: "Former primary school teacher specializing in CBC inquiry-based and competency-centered mathematics methodology.",
    avatarSeed: "grace",
    phone: "+254 734 567890",
    status: "available",
    ubuntuScorePref: 7
  },
  {
    id: "tut-4",
    name: "Victor Kiprop",
    experienceYears: 3,
    subjects: ["CBC Project", "Mentorship", "Device Access"],
    languages: ["Sheng", "Swahili", "English"],
    location: "Kawangware",
    distanceKm: 0.9,
    availability: ["Friday PM", "Saturday AM", "Sunday AM"],
    rating: 4.7,
    bio: "Creator of the 'Street Robot' project, guiding youth to complete challenging CBC design portfolios using discarded e-waste.",
    avatarSeed: "victor",
    phone: "+254 745 678901",
    status: "busy",
    ubuntuScorePref: 5
  },
  {
    id: "tut-5",
    name: "Mercy Wanjiku",
    experienceYears: 5,
    subjects: ["Mathematics", "Mentorship"],
    languages: ["Swahili", "English"],
    location: "Kibera",
    distanceKm: 1.4,
    availability: ["Wednesday PM", "Saturday PM"],
    rating: 4.9,
    bio: "Passionate about girl child tech education. Offering weekend math drills and leadership mentoring.",
    avatarSeed: "mercy",
    phone: "+254 756 789012",
    status: "available",
    ubuntuScorePref: 8
  }
];

export const MOCK_HUBS: Hub[] = [
  {
    id: "hub-1",
    name: "SHOFCO Kibera Empowerment Hub",
    settlement: "Kibera",
    capacityStatus: 72,
    maxCapacity: 50,
    currentCapacity: 36,
    availableAssets: ["WiFi", "Tablets", "Electricity", "Library", "STEM Mentor"],
    walkingDistanceMins: 8,
    coords: { lat: -1.313, lng: 36.788 }
  },
  {
    id: "hub-2",
    name: "Ruben Centre Mukuru",
    settlement: "Mukuru",
    capacityStatus: 85, // Above 80% logic check
    maxCapacity: 80,
    currentCapacity: 68,
    availableAssets: ["WiFi", "Computers", "Electricity", "Science Lab", "Library"],
    walkingDistanceMins: 12,
    coords: { lat: -1.321, lng: 36.871 }
  },
  {
    id: "hub-3",
    name: "Mathare Community Library",
    settlement: "Mathare",
    capacityStatus: 45,
    maxCapacity: 40,
    currentCapacity: 18,
    availableAssets: ["WiFi", "Electricity", "Library", "STEM Mentor"],
    walkingDistanceMins: 5,
    coords: { lat: -1.261, lng: 36.859 }
  },
  {
    id: "hub-4",
    name: "Kawangware Digital Innovation Hub",
    settlement: "Kawangware",
    capacityStatus: 25,
    maxCapacity: 30,
    currentCapacity: 7,
    availableAssets: ["WiFi", "Tablets", "Computers", "Electricity", "STEM Mentor"],
    walkingDistanceMins: 14,
    coords: { lat: -1.284, lng: 36.745 }
  },
  {
    id: "hub-5",
    name: "Mathare Sector 4 Youth Space",
    settlement: "Mathare",
    capacityStatus: 78,
    maxCapacity: 25,
    currentCapacity: 19,
    availableAssets: ["WiFi", "Tablets", "Electricity"],
    walkingDistanceMins: 9,
    coords: { lat: -1.258, lng: 36.862 }
  }
];

export const CBC_DICTIONARY: CbcTerm[] = [
  {
    term: "Competency Based Curriculum (CBC)",
    swahiliTranslation: "Mtaala wa Kukuza Umilisi",
    shengTranslation: "Masomo mpya ya are",
    definitionEn: "A learning system designed to develop skills, values, and knowledge. Its goal is to make learners apply what they learn in classroom activities to real life.",
    definitionSw: "Mfumo wa elimu uliobuniwa kutilia mkazo ukuzaji wa talanta, ujuzi, maadili na ufahamu badala ya kukariri mitihani ili kuangazia umilisi.",
    definitionSheng: "Rada ya daro ambapo msee anasoma mastyle za kuraise talanta zake badala ya kushikilia ma-book pekee kwa ajili ya kufanya exam kupita na kusahau.",
    examples: ["Inquiry-Based Learning", "Parental Engagement projects", "Community Service Learning (CSL)"],
    readingGuide: "Encourage your child to describe how a science lesson applies to tasks at home like water filtration or gardening."
  },
  {
    term: "Core Competencies",
    swahiliTranslation: "Ujuzi wa Kimsingi",
    shengTranslation: "Skillz za base",
    definitionEn: "The seven essential life skills developed in CBC: Communication & Collaboration, Critical Thinking, Creativity, Citizenship, Learning to Learn, Self-efficacy, and Digital Literacy.",
    definitionSw: "Uwezo na ujuzi saba muhimu unaokusudiwa kufunzwa, kama vile ubunifu, ushirikiano, upendo kwa nchi na usomaji wa kiteknolojia.",
    definitionSheng: "Zile masta-skills saba mtoto anaget akisoma, kama vile kuwa creative, kuongea fiti na wenzake, na kuelewa mambo ya tech.",
    examples: ["Writing a story together", "Coding simple patterns", "Local environmental cleanup projects"],
    readingGuide: "Praise your child's effort in solving a dynamic problem, even if they fail first. It boosts self-efficacy!"
  },
  {
    term: "Formative Assessment",
    swahiliTranslation: "Tathmini Endelevu",
    shengTranslation: "Kucheki progress",
    definitionEn: "Ongoing continuous checks of a student's learning progress throughout the term, rather than a single big exam at the very end of the year.",
    definitionSw: "Upimaji wa kila siku kufuatilia maendeleo ya mwanafunzi polepole mtaalani badala ya kungojea mtihani mmoja mkuu mwishoni mwa mwaka.",
    definitionSheng: "Kupima mwanafunzi day-to-day vile anaelewa mada badala ya kuweka mtihani mbaya mwisho wa mwaka inayomletea stress kibao.",
    examples: ["Oral quizzes during lessons", "Practical group projects", "Reflective diaries"],
    readingGuide: "Look at the portfolio files the tutor gives. Look for positive comments on daily growth markers."
  },
  {
    term: "Inquiry-Based Learning",
    swahiliTranslation: "Kujifunza kwa Kuchunguza",
    shengTranslation: "Kugundua mastory",
    definitionEn: "Learning starting with children raising questions, investigating scenarios, and actively solving problems rather than memorizing teacher lectures.",
    definitionSw: "Mbinu ambapo mtoto anakuwa tayari kuuliza maswali, kufanya uchunguzi na kuwa mhusika mkuu wa kujenga ufahamu wake.",
    definitionSheng: "Kusoma kwa kuanza na kuuliza maswali, kufungua duka ya uchunguzi na kubishana mawazo kimaisha badala ya kula tu story za ticha.",
    examples: ["Making homemade thermometers", "Soil drainage investigations", "Mapping settlement water access leaks"],
    readingGuide: "Ask: 'What surprised you about your project today?' instead of 'Did you get it right?'"
  }
];

export const MOCK_BADGES: Badge[] = [
  {
    id: "badge-1",
    name: "Learning Volunteer",
    description: "Assigned to tutors launching their first 5 high-priority sessions mtaani.",
    progress: 80,
    requirements: ["Hold 5 tutoring sessions", "Complete onboarding feedback response", "Validate initial tutor profile data"],
    certificateUnlocked: false,
    hoursRequired: 5,
    studentsImpactedRequired: 2
  },
  {
    id: "badge-2",
    name: "Community Tutor",
    description: "Granted for supporting learners in underserved contexts totaling 20 hours.",
    progress: 100,
    requirements: ["Log 20 certified hours", "Receive > 4.8 average rating from parents", "Host sessions in 2 distinct hubs"],
    certificateUnlocked: true,
    hoursRequired: 20,
    studentsImpactedRequired: 5
  },
  {
    id: "badge-3",
    name: "STEM Catalyst",
    description: "Awarded to tutors driving science experiments and local engineering projects.",
    progress: 40,
    requirements: ["Log 10 science or mathematics sessions", "Guide 2 kids to complete a physical recycled-material CBC STEM portfolio project"],
    certificateUnlocked: false,
    hoursRequired: 15,
    studentsImpactedRequired: 4
  },
  {
    id: "badge-4",
    name: "CBC Impact Mentor",
    description: "Acknowledging deep coaching that successfully translates CBC complex projects for low-literacy family circles.",
    progress: 100,
    requirements: ["Host 5 parental-corner audio demo guides", "Explain 10 CBC core methodologies with active translations"],
    certificateUnlocked: true,
    hoursRequired: 10,
    studentsImpactedRequired: 3
  },
  {
    id: "badge-5",
    name: "DarasaMtaani Fellow",
    description: "Elite status celebrating tutors with persistent community impact across multiple quarters.",
    progress: 15,
    requirements: ["Active for 3 months continuous mtaani", "50 total served hours", "Impact at least 15 unique learners"],
    certificateUnlocked: false,
    hoursRequired: 50,
    studentsImpactedRequired: 15
  }
];

export const INITIAL_REQUESTS: HelpRequest[] = [
  {
    id: "req-1",
    studentName: "Mwangi Kamau",
    requestType: "Science",
    description: "Struggling to build a simple water filtration model for grade 4 CBC environment studies. Need a tutor with simple materials (charcoal, sand).",
    location: "Mathare Sector 3",
    settlement: "Mathare",
    parentName: "Wanjiku Kamau",
    parentContact: "+254 711 223344",
    ubuntuScore: 8.2, // Critical priority
    status: "assigned",
    createdAt: "2026-06-02T10:30:00Z",
    assignedTutorId: "tut-2",
    assignedHubId: "hub-3"
  },
  {
    id: "req-2",
    studentName: "Ashiundu Junior",
    requestType: "WiFi Access",
    description: "Needs access to high-speed wifi and tablet devices to submit CBC mathematics homework portal queries this Saturday.",
    location: "Kibera Soweto East",
    settlement: "Kibera",
    parentName: "Joseph Ashiundu",
    parentContact: "+254 722 334455",
    ubuntuScore: 5.4, // Medium priority
    status: "pending",
    createdAt: "2026-06-03T08:15:00Z"
  },
  {
    id: "req-3",
    studentName: "Neema Atieno",
    requestType: "Mathematics",
    description: "Help with division and patterns. Lost 2 weeks of school due to high family pressure and lack of books.",
    location: "Mukuru Kuinda",
    settlement: "Mukuru",
    parentName: "Atieno Odhiambo",
    parentContact: "+254 733 445566",
    ubuntuScore: 9.1, // Critical Priority
    status: "assigned",
    createdAt: "2026-06-04T12:00:00Z",
    assignedTutorId: "tut-3",
    assignedHubId: "hub-2"
  }
];

export const MOCK_IMPACT: ImpactMetrics = {
  studentsServed: 412,
  tutorsActive: 38,
  volunteerHours: 780,
  learningHubsActive: 5,
  sessionsCompleted: 310
};

// Help recommendations generation logic based on Ubuntu score
export function getRecommendations(age: number, grade: number, subjectStruggles: string[], score: number) {
  const recommendations: string[] = [];
  
  if (score >= 8.0) {
    recommendations.push("🚨 High Priority Priority Routing: Flagged for absolute immediate direct assignment of home-visit or localized STEM tutoring session.");
    recommendations.push("🎁 Safe Space Nutrition: Recommend directing student to Ruben Centre or SHOFCO for free warm snacks served during active tutoring cycles.");
  }
  
  if (subjectStruggles.includes("Mathematics") || subjectStruggles.includes("Science")) {
    recommendations.push("🧪 STEM Catalyst Path: Allocate tablet schedule slots for offline digital math quizzes to bypass textbook shortage.");
    recommendations.push("🎒 Practical Experiments: Engage with the Science experiments program matching nearby SHOFCO kits.");
  }
  
  if (grade <= 3) {
    recommendations.push("📚 Foundational Literacy focus: High emphasis on English/Swahili storytelling and vocal phonics rather than intense test sheets.");
  } else {
    recommendations.push("🧭 Inquiry Task Strategy: Prioritize Guidance for creative CBC projects requiring recycled design materials.");
  }

  recommendations.push("🌐 Hub Connection: Pre-reserve a free tablet check-in allocation of 2 hours per week at their nearest hub.");

  return recommendations;
}
