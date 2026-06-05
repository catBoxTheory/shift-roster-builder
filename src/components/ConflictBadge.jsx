export default function ConflictBadge({ count = 1 }) {
  const label = count > 1 ? `${count} conflicts` : "Conflict";

  return (
    <span className="conflict-badge" aria-label={label}>
      <span aria-hidden="true">!</span>
      {label}
    </span>
  );
}
