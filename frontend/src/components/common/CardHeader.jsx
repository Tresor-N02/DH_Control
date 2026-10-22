export default function CardHeader({ title, icon: Icon, right }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-accent-ink">
            <Icon size={18} />
          </span>
        )}
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
      </div>
      {right}
    </div>
  );
}
