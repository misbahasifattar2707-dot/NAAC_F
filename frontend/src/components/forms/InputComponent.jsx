export default function InputComponent({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className = "",
  id,
  name,
  autoComplete,
}) {
  const cid = id || name || label?.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={cid} className="form-label-custom">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        id={cid}
        name={name}
        type={type}
        className={`form-control form-control-sm${required && !String(value ?? "").trim() ? " border-danger" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}
