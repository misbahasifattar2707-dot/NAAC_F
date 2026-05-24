export default function DatePickerComponent({
  label,
  value,
  onChange,
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
      <input
        id={cid}
        name={name}
        type="date"
        className={`form-control form-control-sm${required && !value ? " border-danger" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
