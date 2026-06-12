import { supabase } from '../../src/lib/supabase';
import { hunterMatch } from '../../src/lib/agents/hunter';

const mockTutors: Record<string, any> = {
  'unverified-tutor-id': {
    id: 'unverified-tutor-id',
    display_name: 'Unverified Tutor',
    verified_by_elder: false,
    rating: 5.0,
    location: { type: 'Point', coordinates: [36.7880, -1.3150] } // Close (0m)
  },
  'verified-tutor-id': {
    id: 'verified-tutor-id',
    display_name: 'Verified Tutor',
    verified_by_elder: true,
    rating: 4.5,
    location: { type: 'Point', coordinates: [36.7880, -1.3150] } // Close (0m)
  }
};

const mockStudents: Record<string, any> = {
  'student-1': {
    id: 'student-1',
    display_name: 'Student A',
    cbc_strands: ['Swahili'],
    households: {
      landmark_code: 'KBR-SOWETO'
    }
  }
};

const mockLandmarks: Record<string, any> = {
  'KBR-SOWETO': {
    code: 'KBR-SOWETO',
    approx_location: { type: 'Point', coordinates: [36.7880, -1.3150] }
  }
};

// Mock supabase client
supabase.from = (table: string) => {
  return {
    select: (query?: string) => ({
      eq: (col: string, val: any) => ({
        single: () => {
          if (table === 'tutors') {
            return Promise.resolve({ data: mockTutors[val] || null, error: mockTutors[val] ? null : new Error('Not found') });
          }
          if (table === 'students') {
            return Promise.resolve({ data: mockStudents[val] || null, error: mockStudents[val] ? null : new Error('Not found') });
          }
          if (table === 'landmarks') {
            return Promise.resolve({ data: mockLandmarks[val] || null, error: mockLandmarks[val] ? null : new Error('Not found') });
          }
          return Promise.resolve({ data: null, error: new Error('Unknown table') });
        }
      })
    }),
    insert: (payload: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'session-123', ...payload }, error: null })
      })
    })
  } as any;
};

async function runTest() {
  console.log("Running Hunter Match Test...");

  // Test 1: Try matching student with unverified tutor
  const unverifiedResult = await hunterMatch('student-1', 'unverified-tutor-id', '1234');
  if (unverifiedResult.status !== 'failed' || !unverifiedResult.error?.includes('BLOCK')) {
    console.error("FAIL: hunterMatch allowed or did not block an unverified tutor!");
    process.exit(1);
  } else {
    console.log("PASS: hunterMatch blocked unverified tutor correctly.");
  }

  // Test 2: Try matching student with verified tutor
  const verifiedResult = await hunterMatch('student-1', 'verified-tutor-id', '1234');
  if (verifiedResult.status !== 'confirmed') {
    console.error("FAIL: hunterMatch failed with verified tutor:", verifiedResult.error);
    process.exit(1);
  } else {
    console.log("PASS: hunterMatch successfully matched verified tutor.");
  }

  console.log("All Hunter Agent tests passed successfully.");
}

runTest().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
