export default function PerRowProofInput({
  label = "Proof (PDF/Image)",
  onFileChange,
}) {
  return (
    <div>
      <label className="form-label-custom">{label}</label>
      <input
        type="file"
        className="form-control form-control-sm"
        accept="application/pdf,.pdf,image/png,image/jpeg,.jpg,.jpeg,.webp,.png"
        onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
      />
      <small className="text-muted">Saved with this row; combine below for Excel link.</small>
    </div>
  );
}
