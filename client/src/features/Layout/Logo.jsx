// Logo BivySwiss (B · Bivouac) : tente en forme de montagne et étoile du soir.
export function Logo({ size = 36, inverted = false, title = 'BivySwiss' }) {
  const main = inverted ? 'var(--colorPaper)' : 'var(--colorSlate)';
  const cut = inverted ? 'var(--colorSlateDeep)' : 'var(--colorPaper)';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={title}>
      <polyline points="54,14 60,24 66,14" fill="none" stroke={main} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="12,100 60,22 108,100" fill={main} />
      <polygon points="60,56 45,100 75,100" fill={cut} />
      <circle cx="96" cy="26" r="5" fill="var(--colorLichen)" />
    </svg>
  );
}
