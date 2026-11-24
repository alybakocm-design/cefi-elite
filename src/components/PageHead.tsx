export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-sable">
      <div className="points pointer-events-none absolute -top-6 right-10 h-40 w-56 opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-rose/60 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 py-16">
        <span className="pastille">{kicker}</span>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight md:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg text-pierre">{children}</div>}
      </div>
    </section>
  );
}
