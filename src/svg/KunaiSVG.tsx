interface Props {
  width: number;
  height: number;
}

export default function KunaiSVG({ width, height }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ width, height, display: 'block', imageRendering: 'pixelated' }}
    >
      {/* Blade tip (upper-right) */}
      <rect x="13" y="1" width="1" height="1" fill="#eeeeee" />
      <rect x="12" y="1" width="1" height="1" fill="#d8d8d8" />
      <rect x="13" y="2" width="1" height="1" fill="#d8d8d8" />
      {/* Blade body - diagonal strip NE→SW */}
      <rect x="11" y="2" width="1" height="1" fill="#cccccc" />
      <rect x="12" y="2" width="1" height="1" fill="#aaaaaa" />
      <rect x="10" y="3" width="1" height="1" fill="#cccccc" />
      <rect x="11" y="3" width="1" height="1" fill="#e0e0e0" />
      <rect x="9"  y="4" width="1" height="1" fill="#bbbbbb" />
      <rect x="10" y="4" width="1" height="1" fill="#d0d0d0" />
      <rect x="8"  y="5" width="1" height="1" fill="#aaaaaa" />
      <rect x="9"  y="5" width="1" height="1" fill="#c4c4c4" />
      <rect x="7"  y="6" width="1" height="1" fill="#a0a0a0" />
      <rect x="8"  y="6" width="1" height="1" fill="#bbbbbb" />
      {/* Collar - dark metal band */}
      <rect x="5"  y="7" width="1" height="1" fill="#555566" />
      <rect x="6"  y="7" width="1" height="1" fill="#44445a" />
      <rect x="7"  y="7" width="1" height="1" fill="#666677" />
      <rect x="6"  y="8" width="1" height="1" fill="#555566" />
      {/* Handle - wrapped leather */}
      <rect x="4"  y="8" width="1" height="1" fill="#3a2a1a" />
      <rect x="5"  y="8" width="1" height="1" fill="#4a3828" />
      <rect x="3"  y="9" width="1" height="1" fill="#3a2a1a" />
      <rect x="4"  y="9" width="1" height="1" fill="#56422e" />
      <rect x="2"  y="10" width="1" height="1" fill="#3a2a1a" />
      <rect x="3"  y="10" width="1" height="1" fill="#4a3828" />
      <rect x="1"  y="11" width="1" height="1" fill="#3a2a1a" />
      <rect x="2"  y="11" width="1" height="1" fill="#56422e" />
      {/* Ring at butt */}
      <rect x="0"  y="12" width="1" height="1" fill="#777777" />
      <rect x="1"  y="12" width="1" height="1" fill="#aaaaaa" />
      <rect x="2"  y="12" width="1" height="1" fill="#999999" />
      <rect x="3"  y="12" width="1" height="1" fill="#777777" />
      <rect x="0"  y="13" width="1" height="1" fill="#888888" />
      <rect x="3"  y="13" width="1" height="1" fill="#888888" />
      <rect x="0"  y="14" width="1" height="1" fill="#666666" />
      <rect x="1"  y="14" width="1" height="1" fill="#888888" />
      <rect x="2"  y="14" width="1" height="1" fill="#888888" />
      <rect x="3"  y="14" width="1" height="1" fill="#666666" />
      {/* Ring interior (dark void) */}
      <rect x="1"  y="13" width="2" height="1" fill="#1a1a1a" />
    </svg>
  );
}
