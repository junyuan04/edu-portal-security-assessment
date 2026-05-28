// Reusable button (supports variant, size, loading state, and full-width)
const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: '',          // default
  lg: 'text-base px-6 py-3',
};

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  fullWidth = false,
  loading  = false,
  disabled = false,
  type     = 'button',
  onClick,
  className = '',
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={`
      ${VARIANTS[variant]}
      ${SIZES[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim()}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading…
      </span>
    ) : children}
  </button>
);

export default Button;


