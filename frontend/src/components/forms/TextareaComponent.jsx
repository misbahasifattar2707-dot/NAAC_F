export default function TextareaComponent({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  id,
  name,
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
      <textarea
        id={cid}
        name={name}
        rows={rows}
        className={`form-control form-control-sm${required && !String(value ?? "").trim() ? " border-danger" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
