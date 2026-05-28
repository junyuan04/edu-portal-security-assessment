const InputField = ({
  label,
  id,
  type      = 'text',
  value,
  onChange,
  placeholder,
  error,
  required  = false,
  disabled  = false,
  className = '',
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
    />
    {error && (
      <p className="text-xs text-red-600">{error}</p>
    )}
  </div>
);

export default InputField;


