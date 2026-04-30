import { useRef, useEffect } from 'react';
import type { GameState } from '../types';
import { CANVAS_W, CANVAS_H } from '../types';
import SceneBackground from './SceneBackground';
import GameItem from './GameItem';

interface Props {
  state: GameState;
  aiSystemPrompt: string;
  apiKey: string;
  isLightOn: boolean;
  onBringToFront: (id: string) => void;
  onPositionCommit: (id: string, xPct: number, yPct: number) => void;
  onGeometryCommit: (id: string, xPct: number, yPct: number, wPct: number, hPct: number) => void;
  onSelectItem: (id: string | null) => void;
  onUpdateDescription: (id: string, desc: string) => void;
  onUpdateTransform: (id: string, rotation: number, flipX: boolean) => void;
  onDeleteItem: (id: string) => void;
}

export default function GameCanvas({
  state, aiSystemPrompt, apiKey, isLightOn,
  onBringToFront, onPositionCommit, onGeometryCommit,
  onSelectItem, onUpdateDescription, onUpdateTransform, onDeleteItem,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const activeScene = state.scenes.find((s) => s.id === state.activeSceneId);
  const activeItems = state.items.filter(
    (i) => i.sceneId === state.activeSceneId && !i.trashed
  );

  // Keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (state.selectedItemId) {
        onDeleteItem(state.selectedItemId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedItemId, onDeleteItem]);

  return (
    <div style={{
      flex: 1, minWidth: 0, minHeight: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0b0f0c',
      backgroundImage: `
        linear-gradient(rgba(127,176,105,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(127,176,105,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '48px 48px',
      overflow: 'auto',
    }}>
      <div
        ref={canvasRef}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          if (e.target === canvasRef.current) onSelectItem(null);
        }}
        style={{
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(127,176,105,0.3), 0 0 80px rgba(0,0,0,0.9)',
        }}
      >
        {activeScene && <SceneBackground scene={activeScene} />}

        {activeItems
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((item) => {
            const itemType = state.itemTypes.find((t) => t.id === item.itemTypeId);
            return (
              <GameItem
                key={item.id}
                item={item}
                itemType={itemType}
                canvasRef={canvasRef}
                isSelected={state.selectedItemId === item.id}
                aiSystemPrompt={aiSystemPrompt}
                apiKey={apiKey}
                isLightOn={isLightOn}
                onBringToFront={onBringToFront}
                onPositionCommit={onPositionCommit}
                onGeometryCommit={onGeometryCommit}
                onSelect={onSelectItem}
                onUpdateDescription={onUpdateDescription}
                onUpdateTransform={onUpdateTransform}
                onDelete={onDeleteItem}
              />
            );
          })}
      </div>
    </div>
  );
}
