import type { ResizeHandle } from '../types';

interface Props {
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
}

const SIZE = 8;

const handles: { key: ResizeHandle; style: React.CSSProperties; cursor: string }[] = [
  { key: 'nw', style: { top: 0, left: 0 },     cursor: 'nw-resize' },
  { key: 'ne', style: { top: 0, right: 0 },     cursor: 'ne-resize' },
  { key: 'sw', style: { bottom: 0, left: 0 },   cursor: 'sw-resize' },
  { key: 'se', style: { bottom: 0, right: 0 },  cursor: 'se-resize' },
];

export default function ResizeHandles({ onResizeStart }: Props) {
  return (
    <>
      {handles.map(({ key, style, cursor }) => (
        <div
          key={key}
          onMouseDown={(e) => onResizeStart(e, key)}
          style={{
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            background: '#ffd84a',
            border: '1.5px solid rgba(0,0,0,0.6)',
            borderRadius: 2,
            cursor,
            zIndex: 10,
            ...style,
          }}
        />
      ))}
    </>
  );
}
