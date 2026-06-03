const METHOD_STYLES = {
  GET:    'bg-blue-900  text-blue-300  border-blue-700',
  POST:   'bg-green-900 text-green-300 border-green-700',
  PUT:    'bg-yellow-900 text-yellow-300 border-yellow-700',
  DELETE: 'bg-red-900   text-red-300   border-red-700',
};

const RequestForm = ({
  method      = 'GET',
  endpoint,
  children,           // optional extra inputs
  onSubmit,
  loading     = false,
  submitLabel = 'Send',
}) => (
  <div className="card-dark flex flex-col gap-4">

    {/* Request line */}
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${METHOD_STYLES[method] || ''}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-gray-300 break-all">{endpoint}</code>
    </div>

    {/* Extra inputs passed as children */}
    {children && <div className="flex flex-col gap-3">{children}</div>}

    <button
      onClick={onSubmit}
      disabled={loading}
      className="btn-green self-start"
    >
      {loading ? 'Sending…' : submitLabel}
    </button>
  </div>
);

export default RequestForm;


