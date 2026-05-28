import { useState } from 'react';
import coursesService   from '../../services/courses.service';
import RequestForm      from '../../components/RequestForm';
import ApiResponseViewer from '../../components/ApiResponseViewer';

const RequestBlock = ({ method, endpoint, children, onSubmit, state }) => (
  <div className="flex flex-col gap-3">
    <RequestForm method={method} endpoint={endpoint} onSubmit={onSubmit} loading={state.loading}>
      {children}
    </RequestForm>
    <ApiResponseViewer
      response={state.response}
      loading={state.loading}
      error={state.error}
      timing={state.timing}
    />
  </div>
);

// Initial state for API requests
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

const CoursesExplorer = ({ token }) => {
  const [listState,      setListState]      = useState(initState());
  const [searchState,    setSearchState]    = useState(initState());
  const [byIdState,      setByIdState]      = useState(initState());
  const [materialsState, setMaterialsState] = useState(initState());

  const [searchQ,      setSearchQ]      = useState('');
  const [courseId,     setCourseId]     = useState('');
  const [materialsCid, setMaterialsCid] = useState('');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Courses</h2>
        <p className="text-sm text-gray-400">Browse the course catalogue via the REST API.</p>
      </div>

      {/* GET /courses */}
      <RequestBlock
        method="GET" endpoint="/courses"
        onSubmit={() => withTiming(setListState, () => coursesService.getAll(token))}
        state={listState}
      />

      {/* GET /courses/search?q= */}
      <RequestBlock
        method="GET" endpoint={`/courses/search?q=${searchQ}`}
        onSubmit={() => withTiming(setSearchState, () => coursesService.search(token, searchQ))}
        state={searchState}
      >
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Search keyword…"
          className="input-dark"
        />
      </RequestBlock>

      {/* GET /courses/:id */}
      <RequestBlock
        method="GET" endpoint={`/courses/${courseId || ':id'}`}
        onSubmit={() => withTiming(setByIdState, () => coursesService.getById(token, courseId))}
        state={byIdState}
      >
        <input
          type="number" value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Course ID (e.g. 1)"
          className="input-dark"
        />
      </RequestBlock>

      {/* GET /courses/:id/materials */}
      <RequestBlock
        method="GET" endpoint={`/courses/${materialsCid || ':id'}/materials`}
        onSubmit={() => withTiming(setMaterialsState, () => coursesService.getMaterials(token, materialsCid))}
        state={materialsState}
      >
        <input
          type="number" value={materialsCid}
          onChange={(e) => setMaterialsCid(e.target.value)}
          placeholder="Course ID (e.g. 1)"
          className="input-dark"
        />
      </RequestBlock>
    </div>
  );
};

export default CoursesExplorer;


