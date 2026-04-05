import { useState, useCallback } from 'react';
import { useGameStore } from './store/useGameStore';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import AssetPanel from './components/AssetPanel';
import SettingsModal from './components/SettingsModal';
import TheaterMode from './components/TheaterMode';
import ChapterManager from './components/ChapterManager';
import ChapterTransition from './components/ChapterTransition';

export default function App() {
  const store = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showTheater, setShowTheater] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [isLightOn, setIsLightOn] = useState(true);
  const [assetPanelOpen, setAssetPanelOpen] = useState(true);

  // Chapter transition state
  const [transitioning, setTransitioning] = useState(false);
  const [pendingChapterId, setPendingChapterId] = useState<string | null | undefined>(undefined);

  const activeChapter = store.state.chapters.find((c) => c.id === store.state.activeChapterId) ?? null;

  // Compose the system prompt: global + chapter modifier
  const effectiveSystemPrompt = [
    store.aiSystemPrompt,
    activeChapter?.systemPromptModifier
      ? `【当前篇章：${activeChapter.name}】\n${activeChapter.systemPromptModifier}`
      : '',
  ].filter(Boolean).join('\n\n');

  // Filter character types by allowedCharacters (empty = all)
  const filteredState = {
    ...store.state,
    itemTypes: store.state.itemTypes.map((t) => {
      if (t.category !== 'character') return t;
      if (!activeChapter || activeChapter.allowedCharacters.length === 0) return t;
      // Mark disallowed characters as unavailable via a flag we'll pass through
      return activeChapter.allowedCharacters.includes(t.id) ? t : { ...t, _chapterHidden: true };
    }),
  };

  // Trigger black-fade then apply chapter change
  const handleActivateChapter = useCallback((chapterId: string | null) => {
    setPendingChapterId(chapterId);
    setTransitioning(true);
    setShowChapters(false);
  }, []);

  // Called by ChapterTransition when black screen is fully visible
  const handleTransitionComplete = useCallback(() => {
    if (pendingChapterId !== undefined) {
      store.setActiveChapter(pendingChapterId);
      // If switching to a chapter with a background image, update active scene
      if (pendingChapterId) {
        const ch = store.state.chapters.find((c) => c.id === pendingChapterId);
        if (ch?.backgroundUrl) {
          store.updateSceneBackground(store.state.activeSceneId, ch.backgroundUrl);
        }
      }
      setPendingChapterId(undefined);
    }
    setTransitioning(false);
  }, [pendingChapterId, store]);

  if (!store.hydrated) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0f', fontSize: 14, color: '#ffd84a',
      }}>
        载入中...
      </div>
    );
  }

  const pendingChapterName = transitioning && pendingChapterId
    ? store.state.chapters.find((c) => c.id === pendingChapterId)?.name
    : undefined;

  // Sidebar toggle styling (warm palette)
  const C = { border: '#4e3418', bg: '#1c1309', text: '#5a4028', gold: '#d4a030' };

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh',
      overflow: 'hidden', background: '#0a0a0f',
    }}>
      {/* Left sidebar */}
      <Sidebar
        state={store.state}
        onSetActiveScene={store.setActiveScene}
        onAddScene={store.addScene}
        onRestoreItem={store.restoreItem}
        onRenameItem={store.renameItem}
        onPermanentlyDeleteItem={store.permanentlyDeleteItem}
        onAddSceneNote={store.addSceneNote}
        onUpdateSceneNote={store.updateSceneNote}
        onDeleteSceneNote={store.deleteSceneNote}
      />

      {/* Canvas area */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        position: 'relative',
        filter: isLightOn ? 'brightness(1)' : 'brightness(0.4) contrast(1.1) saturate(0.7)',
        transition: 'filter 0.5s ease-in-out',
      }}>
        {/* Toolbar */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 100,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          {/* Chapter indicator (shown when a chapter is active) */}
          {activeChapter && (
            <div
              onClick={() => setShowChapters(true)}
              title="当前篇章"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
                background: `${activeChapter.themeColor ?? C.gold}18`,
                border: `1px solid ${activeChapter.themeColor ?? C.gold}55`,
                color: activeChapter.themeColor ?? C.gold,
                fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                flexShrink: 0, transition: 'background 0.15s',
              }}
            >
              ◈ {activeChapter.name}
            </div>
          )}

          {/* Chapter manager button */}
          <button
            onClick={() => setShowChapters(true)}
            style={{
              background: '#1c1309', border: `1px solid ${C.border}`,
              color: '#a08858', cursor: 'pointer', fontSize: 12,
              padding: '6px 12px', borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold;
              (e.currentTarget as HTMLButtonElement).style.color = C.gold;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
              (e.currentTarget as HTMLButtonElement).style.color = '#a08858';
            }}
          >
            ◈ 篇章
          </button>

          {/* Theater mode */}
          <button
            onClick={() => setShowTheater(true)}
            style={{
              background: '#12101e', border: '1px solid #3a2a5a',
              color: '#9a70d0', cursor: 'pointer', fontSize: 12,
              padding: '6px 12px', borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8a0f0';
              (e.currentTarget as HTMLButtonElement).style.color = '#c8a0f0';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a2a5a';
              (e.currentTarget as HTMLButtonElement).style.color = '#9a70d0';
            }}
          >
            ✦ 小剧场
          </button>

          {/* Light toggle */}
          <button
            onClick={() => setIsLightOn((v) => !v)}
            title={isLightOn ? '关灯' : '开灯'}
            style={{
              background: isLightOn ? '#1a1e28' : '#0a0c10',
              border: `1px solid ${isLightOn ? '#ffd84a' : '#446'}`,
              color: isLightOn ? '#ffd84a' : '#446',
              cursor: 'pointer', fontSize: 16, width: 32, height: 32, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease', flexShrink: 0,
            }}
          >
            {isLightOn ? '💡' : '🌑'}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: '#1a1e28', border: '1px solid #444',
              color: '#aaa', cursor: 'pointer', fontSize: 12,
              padding: '6px 12px', borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#ffd84a';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffd84a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#444';
              (e.currentTarget as HTMLButtonElement).style.color = '#aaa';
            }}
          >
            ⚙ 设置
          </button>
        </div>

        <GameCanvas
          state={filteredState as typeof store.state}
          aiSystemPrompt={effectiveSystemPrompt}
          apiKey={store.apiKey}
          isLightOn={isLightOn}
          onBringToFront={store.bringToFront}
          onPositionCommit={store.updateItemPosition}
          onGeometryCommit={store.updateItemGeometry}
          onSelectItem={store.setSelectedItem}
          onUpdateDescription={store.updateItemDescription}
          onUpdateTransform={store.updateItemTransform}
          onDeleteItem={store.deleteItem}
        />
      </div>

      {/* Right sidebar with collapse */}
      <div style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
        <button
          onClick={() => setAssetPanelOpen((v) => !v)}
          title={assetPanelOpen ? '收起侧边栏' : '展开侧边栏'}
          style={{
            position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
            zIndex: 50, width: 20, height: 48,
            background: C.bg, border: `1px solid ${C.border}`,
            borderRight: 'none', borderRadius: '4px 0 0 4px',
            color: C.text, cursor: 'pointer', fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
        >
          {assetPanelOpen ? '»' : '«'}
        </button>

        <div style={{
          width: 200, overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
          ...(assetPanelOpen ? {} : { width: 0 }),
        }}>
          <AssetPanel
            state={filteredState as typeof store.state}
            onAddItem={store.addItemToScene}
            onAddImageItem={(label, url, category) => {
              const newType = store.addImageItemType(label, url, category);
              store.addItemToScene(newType);
            }}
            onUpdateSceneBackground={store.updateSceneBackground}
            onRenameItemType={store.renameItemType}
            onDeleteItemType={store.deleteItemType}
            onUpdateCharacterProfile={store.updateCharacterProfile}
            onAddCharacterPose={store.addCharacterPose}
            onRemoveCharacterPose={store.removeCharacterPose}
            onSetItemPose={store.setItemPose}
          />
        </div>
      </div>

      {/* ── Overlays ── */}
      <ChapterTransition
        visible={transitioning}
        chapterName={pendingChapterName}
        onComplete={handleTransitionComplete}
      />

      {showChapters && (
        <ChapterManager
          state={store.state}
          onClose={() => setShowChapters(false)}
          onActivate={handleActivateChapter}
          onAdd={store.addChapter}
          onUpdate={store.updateChapter}
          onDelete={store.deleteChapter}
        />
      )}

      {showTheater && (
        <TheaterMode
          state={store.state}
          apiKey={store.apiKey}
          onClose={() => setShowTheater(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          apiKey={store.apiKey}
          aiSystemPrompt={store.aiSystemPrompt}
          onSave={(key, prompt) => {
            store.saveApiKey(key);
            store.saveAiSystemPrompt(prompt);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
