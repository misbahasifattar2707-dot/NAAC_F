export default function ValidationMessageComponent({
  message,
  type = "success",
  onClose,
  className = "",
}) {
  if (!message) return null;
  const alertType = type === "danger" ? "danger" : type === "warning" ? "warning" : "success";
  const icon =
    alertType === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
  return (
    <div
      className={`alert alert-${alertType} alert-dismissible d-flex align-items-center gap-2 shadow-sm ${className}`}
      style={{ borderRadius: 10 }}
    >
      <i className={`bi ${icon}`} />
      <span>{message}</span>
      {onClose && (
        <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={onClose} />
      )}
    </div>
  );
}
