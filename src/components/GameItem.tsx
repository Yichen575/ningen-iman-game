import { useState, useRef, useCallback } from 'react';
import type { GameItem as GameItemType, ItemType } from '../types';
import { CANVAS_W, CANVAS_H } from '../types';
import { useDrag } from '../hooks/useDrag';
import { useResize } from '../hooks/useResize';
import ResizeHandles from './ResizeHandles';
import DialogBubble from './DialogBubble';
import EditDescModal from './EditDescModal';
import CharacterDialog from './CharacterDialog';

interface Props {
  item: GameItemType;
  itemType: ItemType | undefined;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isSelected?: boolean;
  aiSystemPrompt: string;
  apiKey: string;
  isLightOn: boolean;
  onBringToFront: (id: string) => void;
  onPositionCommit: (id: string, xPct: number, yPct: number) => void;
  onGeometryCommit: (id: string, xPct: number, yPct: number, wPct: number, hPct: number) => void;
  onSelect: (id: string) => void;
  onUpdateDescription: (id: string, desc: string) => void;
  onUpdateTransform: (id: string, rotation: number, flipX: boolean) => void;
  onDelete: (id: string) => void;
}

export default function GameItem({
  item, itemType, canvasRef, isSelected, aiSystemPrompt, apiKey, isLightOn,
  onBringToFront, onPositionCommit, onGeometryCommit,
  onSelect, onUpdateDescription, onUpdateTransform, onDelete,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rotation = item.rotation ?? 0;
  const flipX = item.flipX ?? false;

  const { onMouseDown } = useDrag({
    item, canvasRef, onBringToFront, onPositionCommit,
    onItemClick: () => setModalOpen(true),
  });

  const { onResizeStart } = useResize({ item, canvasRef, onGeometryCommit });

  // ── Rotation drag ────────────────────────────────────────────────────────────
  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let liveRotation = rotation;

    function onMouseMove(me: MouseEvent) {
      const dx = me.clientX - centerX;
      const dy = me.clientY - centerY;
      // atan2 gives 0° at right, -90° at top; +90 so that "straight up" = 0°
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      // Normalize to -180..180
      deg = ((deg % 360) + 360) % 360;
      if (deg > 180) deg -= 360;
      liveRotation = deg;
      // Live DOM update for smooth feel
      if (el) el.style.transform = `rotate(${deg}deg) scaleX(${flipX ? -1 : 1})`;
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onUpdateTransform(item.id, liveRotation, flipX);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [item.id, rotation, flipX, onUpdateTransform]);

  // ── Flip ─────────────────────────────────────────────────────────────────────
  function handleFlipH(e: React.MouseEvent) {
    e.stopPropagation();
    onUpdateTransform(item.id, rotation, !flipX);
  }

  function handleFlipV(e: React.MouseEvent) {
    e.stopPropagation();
    // Vertical flip = rotate 180° and toggle flipX
    const newRot = ((rotation + 180 + 180) % 360) - 180;
    onUpdateTransform(item.id, newRot, flipX);
  }

  // ── Glow (on img so it follows alpha shape) ──────────────────────────────────
  const imgGlow = isHovered
    ? 'drop-shadow(0 0 4px rgba(255,220,80,0.95)) drop-shadow(0 0 10px rgba(255,200,40,0.7)) drop-shadow(0 0 20px rgba(255,180,20,0.4))'
    : 'none';

  const cssTransform = `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1})`;

  return (
    <>
      <div
        ref={containerRef}
        data-item-id={item.id}
        onMouseDown={(e) => { onSelect(item.id); onMouseDown(e); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: item.xPct * CANVAS_W,
          top: item.yPct * CANVAS_H,
          width: item.wPct * CANVAS_W,
          height: item.hPct * CANVAS_H,
          zIndex: item.zIndex,
          cursor: 'grab',
          userSelect: 'none',
          background: 'none',
          transform: cssTransform,
          transformOrigin: 'center center',
        }}
      >
        {itemType?.kind === 'image' && (() => {
          const activePose = itemType.poses?.find((p) => p.id === item.currentPoseId)
            ?? itemType.poses?.[0];
          const src = activePose?.imageUrl ?? itemType.imageUrl;
          if (!src) return null;
          return (
            <img
              src={src}
              alt={item.label}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
                background: 'transparent',
                filter: imgGlow,
                transition: 'filter 0.12s ease',
              }}
            />
          );
        })()}

        {isHovered && (
          <ResizeHandles onResizeStart={onResizeStart} />
        )}

        {isHovered && !modalOpen && canvasRef.current && containerRef.current && (() => {
          const ir = containerRef.current!.getBoundingClientRect();
          const cr = canvasRef.current!.getBoundingClientRect();
          return (
            <DialogBubble
              item={item}
              cx={ir.left + ir.width / 2 - cr.left}
              topY={ir.top - cr.top}
              canvasEl={canvasRef.current!}
              onEditClick={() => setModalOpen(true)}
            />
          );
        })()}

        {/* ── Rotate handle (selected state) ─────────────────────────────── */}
        {isSelected && !modalOpen && (
          <div
            onMouseDown={handleRotateStart}
            title="拖拽旋转"
            style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#1a1e28',
              border: '1.5px solid #ffd84a',
              color: '#ffd84a',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              zIndex: 20,
              userSelect: 'none',
            }}
          >
            ↻
          </div>
        )}

        {/* ── Flip toolbar (selected state) ───────────────────────────────── */}
        {isSelected && !modalOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 4,
              zIndex: 20,
            }}
          >
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleFlipH}
              title="水平翻转"
              style={{
                background: '#1a1e28',
                border: '1px solid #556',
                color: '#aabbcc',
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 3,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              ⇄
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleFlipV}
              title="垂直翻转"
              style={{
                background: '#1a1e28',
                border: '1px solid #556',
                color: '#aabbcc',
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 3,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              ↕
            </button>
          </div>
        )}
      </div>

      {modalOpen && itemType?.category === 'character' && (
        <CharacterDialog
          item={item}
          itemType={itemType}
          apiKey={apiKey}
          onDelete={() => onDelete(item.id)}
          onClose={() => setModalOpen(false)}
        />
      )}

      {modalOpen && itemType?.category !== 'character' && (
        <EditDescModal
          item={item}
          aiSystemPrompt={aiSystemPrompt}
          apiKey={apiKey}
          isLightOn={isLightOn}
          onSave={(desc) => onUpdateDescription(item.id, desc)}
          onDelete={() => onDelete(item.id)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
