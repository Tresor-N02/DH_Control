export default function CardBody({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        p-2
        ${className}
      `}
    >
      {children}
    </div>
  );
}