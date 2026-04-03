interface Props {
  width: number;
  height: number;
}

export default function CupSVG({ width, height }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ width, height, display: 'block', imageRendering: 'pixelated' }}
    >
      {/* Top rim */}
      <rect x="3" y="2" width="9" height="1" fill="#8aabba" />
      <rect x="4" y="3" width="7" height="1" fill="#c0d4de" />
      {/* Left wall */}
      <rect x="3" y="3" width="1" height="9" fill="#7a9aaa" />
      {/* Right wall */}
      <rect x="11" y="3" width="1" height="9" fill="#608898" />
      {/* Cup interior - fill */}
      <rect x="4" y="4" width="7" height="7" fill="#52717f" />
      {/* Water - dark blue fill from bottom */}
      <rect x="4" y="7" width="7" height="4" fill="#3a7898" />
      {/* Water surface */}
      <rect x="4" y="7" width="7" height="1" fill="#5aaace" />
      {/* Water highlight */}
      <rect x="5" y="8" width="3" height="1" fill="#80c0e0" />
      {/* Cup bottom */}
      <rect x="4" y="11" width="7" height="1" fill="#608898" />
      {/* Base shadow */}
      <rect x="5" y="12" width="5" height="1" fill="#446070" />
      {/* Handle - right side */}
      <rect x="12" y="5" width="1" height="1" fill="#7a9aaa" />
      <rect x="13" y="5" width="1" height="1" fill="#608898" />
      <rect x="13" y="6" width="1" height="2" fill="#608898" />
      <rect x="12" y="8" width="1" height="1" fill="#7a9aaa" />
      <rect x="13" y="8" width="1" height="1" fill="#608898" />
      {/* Handle inner void */}
      <rect x="12" y="6" width="1" height="2" fill="#202e38" />
      {/* Rim specular highlight */}
      <rect x="5" y="2" width="3" height="1" fill="#b8d0dc" />
    </svg>
  );
}
