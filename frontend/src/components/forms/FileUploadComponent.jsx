import { useRef } from "react";

/**
 * Multi-file picker for evidence uploads; parent posts FormData via uploadEvidence().
 */
export default function FileUploadComponent({
  label = "Supporting documents",
  accept = ".pdf,.png,.jpg,.jpeg,.xlsx,.xls",
  multiple = true,
  onChange,
  disabled = false,
  className = "",
}) {
  const ref = useRef(null);
  return (
    <div className={className}>
      {label && <label className="form-label-custom d-block">{label}</label>}
      <input
        ref={ref}
        type="file"
        className="form-control form-control-sm"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files)}
      />
      <small className="text-muted">PDF, images, or Excel — combined on the server when using “Upload evidence”.</small>
    </div>
  );
}
