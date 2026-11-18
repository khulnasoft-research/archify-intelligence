const capabilities = [
  ['Repository intelligence', 'Inspect repository structure, dependencies, and source evidence.'],
  ['Hybrid judgment', 'Use Jev online when allowed, or a separately calibrated local model.'],
  ['Architecture visualization', 'Render validated diagrams through the pinned Archify engine.'],
  ['Deterministic policy', 'Keep approvals and security decisions in auditable application code.'],
];

export default function HomePage() {
  return <main className="shell">
    <nav className="nav"><span className="brand-mark">A</span><strong>ARCHIFY INTELLIGENCE</strong><span className="nav-note">DEVELOPER PREVIEW · 0.1.0</span></nav>
    <section className="hero">
      <p className="eyebrow">UNDERSTAND · JUDGE · VISUALIZE</p>
      <h1>Architecture intelligence,<br /><span>with evidence.</span></h1>
      <p className="intro">A hybrid platform scaffold for repository understanding, structured AI judgments, deterministic policy evaluation, and interactive architecture artifacts.</p>
      <div className="status"><i /> Foundation scaffold initialized <span>Not production-ready</span></div>
    </section>
    <section className="grid">{capabilities.map(([title, body], index) => <article className="tile" key={title}><span className="index">0{index + 1}</span><h2>{title}</h2><p>{body}</p></article>)}</section>
    <footer>Archify Intelligence <span>Hybrid by design · Local-first privacy controls</span></footer>
  </main>;
}
