export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-line bg-panel shadow-md overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
