export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="shell pt-12 pb-8 sm:pt-16 sm:pb-10">
      {eyebrow ? <p className="label text-muted-foreground">{eyebrow}</p> : null}
      <h1 className="display mt-3 text-[length:var(--text-display-l)] text-balance">{title}</h1>
      {children ? (
        <div className="mt-4 max-w-[60ch] text-lg text-muted-foreground">{children}</div>
      ) : null}
    </header>
  );
}
