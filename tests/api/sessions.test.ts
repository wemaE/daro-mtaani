import { supabase } from '../../src/lib/supabase';
import handler from '../../api/sessions/create';

const mockTutor = {
  id: 'tutor-1',
  display_name: 'Verified Tutor',
  verified_by_elder: true,
  rating: 4.8,
  location: { type: 'Point', coordinates: [36.7880, -1.3150] }
};

const mockStudent = {
  id: 'student-1',
  display_name: 'Student A',
  cbc_strands: ['Math'],
  households: {
    landmark_code: 'KBR-SOWETO'
  }
};

const mockLandmark = {
  code: 'KBR-SOWETO',
  approx_location: { type: 'Point', coordinates: [36.7880, -1.3150] }
};

supabase.from = (table: string) => {
  return {
    select: (query?: string) => ({
      eq: (col: string, val: any) => ({
        single: () => {
          if (table === 'tutors') return Promise.resolve({ data: mockTutor, error: null });
          if (table === 'students') return Promise.resolve({ data: mockStudent, error: null });
          if (table === 'landmarks') return Promise.resolve({ data: mockLandmark, error: null });
          return Promise.resolve({ data: null, error: new Error('Not found') });
        }
      })
    }),
    insert: (payload: any) => {
      if (payload.status === 'confirmed' && (!payload.elder_approval_pin || payload.elder_approval_pin === '')) {
        return {
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Session confirmation requires a valid Elders Council approval PIN.') })
          })
        };
      }
      return {
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'session-789', ...payload }, error: null })
        })
      };
    }
  } as any;
};

function createMockResponse() {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  return res;
}

async function runTest() {
  console.log("Running Sessions API Endpoints & Trigger Validation Tests...");

  const req1: any = {
    method: 'POST',
    body: {
      studentId: 'student-1',
      tutorId: 'tutor-1',
      scheduledAt: new Date().toISOString()
    }
  };
  const res1 = createMockResponse();

  await handler(req1, res1);

  if (res1.body.status !== 'pending_elder_approval') {
    console.error("FAIL: API did not return pending_elder_approval without pin!", res1.body);
    process.exit(1);
  } else {
    console.log("PASS: API returned pending_elder_approval when no pin is provided.");
  }

  const insertResult = await supabase.from('sessions').insert({
    student_id: 'student-1',
    tutor_id: 'tutor-1',
    status: 'confirmed',
    elder_approval_pin: null
  }).select().single();

  if (!insertResult.error || !insertResult.error.message.includes('Session confirmation requires a valid Elders Council approval PIN.')) {
    console.error("FAIL: DB Trigger simulation did not reject confirmed session with null pin!", insertResult.error);
    process.exit(1);
  } else {
    console.log("PASS: DB Trigger simulation rejected confirmed session with null pin successfully.");
  }

  console.log("All Sessions API and Trigger tests passed successfully.");
}

runTest().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
