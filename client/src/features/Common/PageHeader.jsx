export function PageHeader({ eyebrow, title, lede, children }) {
  return (
    <header className="pageHeader" data-reveal>
      {eyebrow && <span className="pageHeaderEyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {lede && <p className="pageHeaderLede">{lede}</p>}
      {children}
    </header>
  );
}
