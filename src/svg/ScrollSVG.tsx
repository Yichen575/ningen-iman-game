interface Props {
  width: number;
  height: number;
}

export default function ScrollSVG({ width, height }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ width, height, display: 'block', imageRendering: 'pixelated' }}
    >
      {/* Left rolled cap */}
      <rect x="0" y="4" width="2" height="1" fill="#2a1a0a" />
      <rect x="0" y="5" width="2" height="1" fill="#3a2a1a" />
      <rect x="1" y="5" width="1" height="1" fill="#6a5a3a" />
      <rect x="0" y="6" width="2" height="1" fill="#4a3a2a" />
      <rect x="0" y="7" width="2" height="1" fill="#503c22" />
      <rect x="0" y="8" width="2" height="1" fill="#503c22" />
      <rect x="0" y="9" width="2" height="1" fill="#4a3a2a" />
      <rect x="0" y="10" width="2" height="1" fill="#3a2a1a" />
      <rect x="1" y="10" width="1" height="1" fill="#2a1a08" />
      <rect x="0" y="11" width="2" height="1" fill="#2a1a0a" />
      {/* Right rolled cap */}
      <rect x="14" y="4" width="2" height="1" fill="#2a1a0a" />
      <rect x="14" y="5" width="2" height="1" fill="#3a2a1a" />
      <rect x="14" y="5" width="1" height="1" fill="#6a5a3a" />
      <rect x="14" y="6" width="2" height="1" fill="#4a3a2a" />
      <rect x="14" y="7" width="2" height="1" fill="#503c22" />
      <rect x="14" y="8" width="2" height="1" fill="#503c22" />
      <rect x="14" y="9" width="2" height="1" fill="#4a3a2a" />
      <rect x="14" y="10" width="2" height="1" fill="#3a2a1a" />
      <rect x="14" y="11" width="2" height="1" fill="#2a1a0a" />
      {/* Parchment body */}
      <rect x="2" y="3" width="12" height="10" fill="#d4c49a" />
      {/* Top/bottom edges slightly darker */}
      <rect x="2" y="3" width="12" height="1" fill="#b8a87a" />
      <rect x="2" y="12" width="12" height="1" fill="#b8a87a" />
      {/* Horizontal texture lines */}
      <rect x="3" y="5" width="10" height="1" fill="#c2b286" />
      <rect x="3" y="7" width="10" height="1" fill="#c2b286" />
      <rect x="3" y="9" width="10" height="1" fill="#c2b286" />
      {/* Ink strokes - stylized kanji-like pattern */}
      <rect x="5"  y="5" width="3" height="1" fill="#1a1a1a" />
      <rect x="5"  y="6" width="1" height="4" fill="#1a1a1a" />
      <rect x="5"  y="8" width="3" height="1" fill="#1a1a1a" />
      <rect x="9"  y="5" width="1" height="5" fill="#1a1a1a" />
      <rect x="9"  y="9" width="2" height="1" fill="#1a1a1a" />
      {/* Red seal */}
      <rect x="11" y="9" width="2" height="2" fill="#bb2020" />
      <rect x="11" y="9" width="1" height="1" fill="#ee4040" />
    </svg>
  );
}
