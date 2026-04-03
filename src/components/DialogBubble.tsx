import ReactDOM from 'react-dom';
import type { GameItem } from '../types';

interface Props {
  item: GameItem;
  // Canvas-relative pixel position of the item's top-center (post-rotation)
  cx: number;
  topY: number;
  canvasEl: HTMLDivElement;
  onEditClick: () => void;
}

export default function DialogBubble({ item, cx, topY, canvasEl, onEditClick }: Props) {
  const bubble = (
    <div
      onClick={(e) => { e.stopPropagation(); onEditClick(); }}
      style={{
        position: 'absolute',
        // Place bottom of bubble 12px above item's top edge
        top: topY - 12,
        left: cx,
        transform: 'translate(-50%, -100%)',
        background: '#1a1e28',
        border: '2px solid #ffd84a',
        borderRadius: 6,
        padding: '7px 12px',
        minWidth: 110,
        maxWidth: 220,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        zIndex: 9000,
        fontSize: 12,
        color: '#ffd84a',
        lineHeight: 1.5,
        boxShadow: '0 0 8px rgba(255,216,74,0.4)',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {item.description
        ? <span style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#e8e0c0' }}>
            {item.description.slice(0, 40)}{item.description.length > 40 ? '…' : ''}
          </span>
        : <span style={{ color: '#aaa' }}>点击编辑描述</span>
      }
      {/* Speech bubble tail */}
      <div style={{
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '8px solid #ffd84a',
      }} />
    </div>
  );

  return ReactDOM.createPortal(bubble, canvasEl);
}
