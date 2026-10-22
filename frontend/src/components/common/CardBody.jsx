export default function CardBody({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
