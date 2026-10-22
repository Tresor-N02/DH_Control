export default function CardHeader({
  title,
  icon: Icon,
  right,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        px-2
        py-1
        border-b
        border-slate-800
      "
    >
      <div className="flex items-center gap-2">

        {Icon && (
          <Icon
            size={16}
            className="text-cyan-400"
          />
        )}

        <h2 className="text-sm font-semibold">

          {title}

        </h2>

      </div>

      {right}
    </div>
  );
}