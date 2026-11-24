export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="motif border-b border-trait">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-rouge">{kicker}</p>
        <h1 className="mt-2 text-5xl font-semibold leading-tight">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg text-pierre">{children}</div>}
      </div>
    </section>
  );
}
