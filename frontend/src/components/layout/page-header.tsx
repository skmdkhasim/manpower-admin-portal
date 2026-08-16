export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p
            className="font-mono text-[13px] font-medium"
            style={{ letterSpacing: "0.65px", color: "#2F6FED" }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-1 text-[28px] font-medium text-ink-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-graphite-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
