const StatusBadge = ({ status }) => {
  const color =
    status >= 500 ? 'bg-red-900 text-red-300 border-red-700' :
    status >= 400 ? 'bg-orange-900 text-orange-300 border-orange-700' :
    status >= 200 ? 'bg-green-900 text-green-300 border-green-700' :
                    'bg-gray-800 text-gray-400 border-gray-700';
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${color}`}>
      {status}
    </span>
  );
};

const ApiResponseViewer = ({ response, loading, error, timing }) => {
  if (loading) return (
    <div className="card-dark flex items-center gap-3 text-sm text-gray-400">
      <svg className="animate-spin h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      Sending request…
    </div>
  );

  if (!response && !error) return (
    <div className="card-dark text-sm text-gray-600 text-center py-6">
      Response will appear here after you send a request.
    </div>
  );

  return (
    <div className="card-dark flex flex-col gap-3">

      {/* Response meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        {response && <StatusBadge status={response.status} />}
        {error     && <span className="text-xs font-mono text-red-400">Network / Auth Error</span>}
        {timing    && <span className="text-xs text-gray-500">{timing}ms</span>}
      </div>

      <pre className="text-xs font-mono text-gray-300 bg-gray-950 rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
        {error
          ? <span className="text-red-400">{error}</span>
          : JSON.stringify(response?.data, null, 2)
        }
      </pre>
    </div>
  );
};

export default ApiResponseViewer;


