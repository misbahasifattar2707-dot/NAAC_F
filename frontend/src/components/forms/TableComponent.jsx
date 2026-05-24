/**
 * Simple styled table wrapper with optional loading overlay.
 */
export default function TableComponent({ children, loading = false, className = "", responsive = true }) {
  const wrap = (
    <div className={`table-responsive ${className}`}>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : (
        children
      )}
    </div>
  );
  if (responsive) return wrap;
  return loading ? (
    <div className="text-center py-5">
      <div className="spinner-border text-danger" role="status" />
    </div>
  ) : (
    children
  );
}
