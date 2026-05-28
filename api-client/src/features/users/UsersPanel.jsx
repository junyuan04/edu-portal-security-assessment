import { useState } from 'react';
import usersService      from '../../services/users.service';
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

const UsersPanel = ({ token }) => {
  const [meState,    setMeState]    = useState(initState());
  const [byIdState,  setByIdState]  = useState(initState());
  const [userId,     setUserId]     = useState('');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Users</h2>
        <p className="text-sm text-gray-400">
          Fetch user profiles via the REST API. Requires a valid JWT.
        </p>
      </div>

      {/* GET /users/me */}
      <div className="flex flex-col gap-3">
        <RequestForm
          method="GET" endpoint="/users/me"
          onSubmit={() => withTiming(setMeState, () => usersService.getMe(token))}
          loading={meState.loading}
        />
        <ApiResponseViewer {...meState} />
      </div>

      {/* GET /users/:id */}
      <div className="flex flex-col gap-3">
        <RequestForm
          method="GET" endpoint={`/users/${userId || ':id'}`}
          onSubmit={() => withTiming(setByIdState, () => usersService.getById(token, userId))}
          loading={byIdState.loading}
        >
          <input
            type="number" value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID (e.g. 4)"
            className="input-dark"
          />
        </RequestForm>
        <ApiResponseViewer {...byIdState} />
      </div>
    </div>
  );
};

export default UsersPanel;


