import { useState } from 'react';
import enrolmentsService from '../../services/enrolments.service';
import RequestForm       from '../../components/RequestForm';
import ApiResponseViewer from '../../components/ApiResponseViewer';

const initState = () => ({ response: null, loading: false, error: null, timing: null });

const withTiming = async (setState, fn) => {
  setState((s) => ({ ...s, loading: true, error: null }));
  const t0 = Date.now();
  try {
    const response = await fn();
    setState({ response, loading: false, error: null, timing: Date.now() - t0 });
  } catch (err) {
    setState({ response: null, loading: false, error: err.message, timing: null });
  }
};


const EnrolmentsViewer = ({ token }) => {
  const [myState,    setMyState]    = useState(initState());
  const [idorState,  setIdorState]  = useState(initState());
  const [createState, setCreateState] = useState(initState());

  const [enrolmentId, setEnrolmentId] = useState('');
  const [courseId,    setCourseId]    = useState('');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Enrolments</h2>
        <p className="text-sm text-gray-400">
          Interact with the enrolment endpoints. Requires a valid JWT in the header above.
        </p>
      </div>

      {/* GET /enrolments/my */}
      <div className="flex flex-col gap-3">
        <RequestForm
          method="GET" endpoint="/enrolments/my"
          onSubmit={() => withTiming(setMyState, () => enrolmentsService.getMy(token))}
          state={myState}
          loading={myState.loading}
        />
        <ApiResponseViewer {...myState} />
      </div>

      {/* IDOR demo block */}
      <div className="flex flex-col gap-3">

        <div className="border border-red-800 bg-red-950/40 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="badge-vuln">VULN-V3 IDOR</span>
            <span className="text-xs text-red-400 font-semibold">A01: Broken Access Control</span>
          </div>
          <p className="text-xs text-red-300 leading-relaxed">
            <code className="font-mono">GET /enrolments/:id</code> returns any enrolment record
            regardless of who owns it. The api-server does not verify that the requesting user
            matches the <code className="font-mono">user_id</code> on the record.
          </p>
          <p className="text-xs text-gray-400">
            <strong className="text-gray-300">Exploit:</strong> Log in as{' '}
            <code className="font-mono text-yellow-400">siti.rahimah</code>, paste her JWT above,
            then request <code className="font-mono text-yellow-400">enrolment id 1</code> — which
            belongs to <code className="font-mono text-yellow-400">ali.hassan</code>. The response
            will expose ali.hassan's email, course, and progress.
          </p>
        </div>

        <RequestForm
          method="GET"
          endpoint={`/enrolments/${enrolmentId || ':id'}`}
          onSubmit={() => withTiming(setIdorState, () => enrolmentsService.getById(token, enrolmentId))}
          loading={idorState.loading}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">
              Enrolment ID{' '}
              <span className="text-gray-600">
                (try 1–10 — seed data has 10 enrolments across 6 students)
              </span>
            </label>
            <input
              type="number"
              value={enrolmentId}
              onChange={(e) => setEnrolmentId(e.target.value)}
              placeholder="e.g. 1"
              className="input-dark"
            />
          </div>
        </RequestForm>
        <ApiResponseViewer {...idorState} />
      </div>

      {/* POST /enrolments */}
      <div className="flex flex-col gap-3">
        <RequestForm
          method="POST" endpoint="/enrolments"
          onSubmit={() => withTiming(setCreateState, () => enrolmentsService.create(token, courseId))}
          loading={createState.loading}
          submitLabel="Enrol"
        >
          <input
            type="number" value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Course ID to enrol in"
            className="input-dark"
          />
        </RequestForm>
        <ApiResponseViewer {...createState} />
      </div>
    </div>
  );
};

export default EnrolmentsViewer;


