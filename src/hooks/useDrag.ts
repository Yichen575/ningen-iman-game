import { useRef, useCallback } from 'react';
import type { GameItem } from '../types';
import { CANVAS_W, CANVAS_H } from '../types';

const DRAG_THRESHOLD_PX = 4;

interface UseDragOptions {
  item: GameItem;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onBringToFront: (itemId: string) => void;
  onPositionCommit: (itemId: string, xPct: number, yPct: number) => void;
  onItemClick: () => void;
}

export function useDrag({ item, canvasRef, onBringToFront, onPositionCommit, onItemClick }: UseDragOptions) {
  const pending = useRef(false);    // mousedown happened, not yet classified
  const dragging = useRef(false);   // displacement exceeded threshold
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ xPct: 0, yPct: 0 });
  const livePos = useRef({ xPct: 0, yPct: 0 });

  function getEl(): HTMLElement | null {
    return canvasRef.current?.querySelector(`[data-item-id="${item.id}"]`) ?? null;
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!pending.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      // Activate drag only after threshold
      if (!dragging.current) {
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD_PX) return;
        dragging.current = true;
        const el = getEl();
        if (el) {
          el.classList.add('is-dragging');
          el.style.opacity = '0.85';
        }
      }

      const rect = canvas.getBoundingClientRect();
      const newXPct = Math.max(0, Math.min(1 - item.wPct, startPos.current.xPct + dx / rect.width));
      const newYPct = Math.max(0, Math.min(1 - item.hPct, startPos.current.yPct + dy / rect.height));
      livePos.current = { xPct: newXPct, yPct: newYPct };

      const el = getEl();
      if (el) {
        el.style.left = `${newXPct * CANVAS_W}px`;
        el.style.top  = `${newYPct * CANVAS_H}px`;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvasRef, item.wPct, item.hPct]
  );

  const handleMouseUp = useCallback(() => {
    if (!pending.current) return;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    const wasDrag = dragging.current;
    pending.current  = false;
    dragging.current = false;

    const el = getEl();

    if (wasDrag) {
      // Restore visual state, commit final position
      if (el) {
        el.classList.remove('is-dragging');
        el.style.opacity = '';
      }
      onPositionCommit(item.id, livePos.current.xPct, livePos.current.yPct);
    } else {
      // Sub-threshold movement → treat as click
      onItemClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMouseMove, item.id, onPositionCommit, onItemClick]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      // Do NOT call e.preventDefault() — that would suppress click/bubble events
      e.stopPropagation();

      onBringToFront(item.id);

      startMouse.current = { x: e.clientX, y: e.clientY };
      startPos.current   = { xPct: item.xPct, yPct: item.yPct };
      livePos.current    = { xPct: item.xPct, yPct: item.yPct };
      pending.current    = true;
      dragging.current   = false;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, item.xPct, item.yPct, onBringToFront, handleMouseMove, handleMouseUp]
  );

  return { onMouseDown };
}
