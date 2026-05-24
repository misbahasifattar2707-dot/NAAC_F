/**
 * Reusable select — use for academic year, department, programme, Yes/No, etc.
 */
export default function DropdownComponent({
  label,
  value,
  onChange,
  options = [],
  optionValue = (o) => (typeof o === "object" ? o.value ?? o.code ?? o : o),
  optionLabel = (o) => (typeof o === "object" ? o.label ?? o.name ?? String(o) : String(o)),
  placeholder = "Select…",
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
      <select
        id={cid}
        name={name}
        className={`form-select form-select-sm${required && !value ? " border-danger" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((o, i) => {
          const v = optionValue(o);
          const lab = optionLabel(o);
          return (
            <option key={`${v}-${i}`} value={v}>
              {lab}
            </option>
          );
        })}
      </select>
    </div>
  );
}
