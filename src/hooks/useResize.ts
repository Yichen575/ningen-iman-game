import { useRef, useCallback } from 'react';
import type { GameItem, ResizeHandle } from '../types';
import { CANVAS_W, CANVAS_H } from '../types';

const MIN_W_PCT = 40 / CANVAS_W;
const MIN_H_PCT = 40 / CANVAS_H;

interface UseResizeOptions {
  item: GameItem;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onGeometryCommit: (itemId: string, xPct: number, yPct: number, wPct: number, hPct: number) => void;
}

export function useResize({ item, canvasRef, onGeometryCommit }: UseResizeOptions) {
  const resizing = useRef(false);
  const handle = useRef<ResizeHandle>('se');
  const startMouse = useRef({ x: 0, y: 0 });
  const startGeo = useRef({ xPct: 0, yPct: 0, wPct: 0, hPct: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const deltaXPct = (e.clientX - startMouse.current.x) / rect.width;
      const deltaYPct = (e.clientY - startMouse.current.y) / rect.height;
      const { xPct, yPct, wPct, hPct } = startGeo.current;

      let newX = xPct, newY = yPct, newW = wPct, newH = hPct;

      switch (handle.current) {
        case 'se':
          newW = Math.max(MIN_W_PCT, wPct + deltaXPct);
          newH = Math.max(MIN_H_PCT, hPct + deltaYPct);
          break;
        case 'sw':
          newW = Math.max(MIN_W_PCT, wPct - deltaXPct);
          newX = xPct + wPct - newW;
          newH = Math.max(MIN_H_PCT, hPct + deltaYPct);
          break;
        case 'ne':
          newW = Math.max(MIN_W_PCT, wPct + deltaXPct);
          newH = Math.max(MIN_H_PCT, hPct - deltaYPct);
          newY = yPct + hPct - newH;
          break;
        case 'nw':
          newW = Math.max(MIN_W_PCT, wPct - deltaXPct);
          newX = xPct + wPct - newW;
          newH = Math.max(MIN_H_PCT, hPct - deltaYPct);
          newY = yPct + hPct - newH;
          break;
      }

      // Clamp to canvas bounds
      newX = Math.max(0, Math.min(1 - newW, newX));
      newY = Math.max(0, Math.min(1 - newH, newY));

      // Direct DOM update for smooth resize
      const el = canvas.querySelector(`[data-item-id="${item.id}"]`) as HTMLElement | null;
      if (el) {
        el.style.left = `${newX * CANVAS_W}px`;
        el.style.top = `${newY * CANVAS_H}px`;
        el.style.width = `${newW * CANVAS_W}px`;
        el.style.height = `${newH * CANVAS_H}px`;
      }

      // Store live values for commit
      startGeo.current = { xPct: newX, yPct: newY, wPct: newW, hPct: newH };
      startMouse.current = { x: e.clientX, y: e.clientY };
    },
    [canvasRef, item.id]
  );

  const handleMouseUp = useCallback(() => {
    if (!resizing.current) return;
    resizing.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    const { xPct, yPct, wPct, hPct } = startGeo.current;
    onGeometryCommit(item.id, xPct, yPct, wPct, hPct);
  }, [handleMouseMove, item.id, onGeometryCommit]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent, h: ResizeHandle) => {
      e.preventDefault();
      e.stopPropagation();
      resizing.current = true;
      handle.current = h;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startGeo.current = { xPct: item.xPct, yPct: item.yPct, wPct: item.wPct, hPct: item.hPct };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [item.xPct, item.yPct, item.wPct, item.hPct, handleMouseMove, handleMouseUp]
  );

  return { onResizeStart };
}
