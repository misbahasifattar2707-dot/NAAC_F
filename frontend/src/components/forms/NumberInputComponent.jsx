export default function NumberInputComponent({
  label,
  value,
  onChange,
  min,
  max,
  step,
  placeholder = "0",
  required = false,
  disabled = false,
  className = "",
  id,
  name,
}) {
  const cid = id || name || label?.replace(/\s+/g, "-").toLowerCase();
  const v = value === "" || value === undefined || value === null ? "" : value;
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
        type="number"
        min={min}
        max={max}
        step={step}
        className={`form-control form-control-sm${required && (v === "" || v === undefined) ? " border-danger" : ""}`}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
