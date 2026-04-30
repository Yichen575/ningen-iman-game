import { useState, useCallback } from 'react';
import { useGameStore } from './store/useGameStore';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import AssetPanel from './components/AssetPanel';
import SettingsModal from './components/SettingsModal';
import TheaterMode from './components/TheaterMode';
import ChapterManager from './components/ChapterManager';
import ChapterTransition from './components/ChapterTransition';
import LandingPage from './components/landing/LandingPage';

export default function App() {
  const store = useGameStore();
  const [page, setPage] = useState<'landing' | 'game'>('landing');
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
        flexDirection: 'column', gap: 16, background: '#0b0f0c',
      }}>
        <div style={{
          fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif",
          fontSize: 42, fontWeight: 800, color: '#ff6b1a', letterSpacing: '0.12em',
        }}>人間未満</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: '#7fb069', letterSpacing: '0.4em', opacity: 0.7,
        }}>LOADING · NINGEN IMAN</div>
      </div>
    );
  }

  if (page === 'landing') {
    return <LandingPage onPlay={() => setPage('game')} />;
  }

  const pendingChapterName = transitioning && pendingChapterId
    ? store.state.chapters.find((c) => c.id === pendingChapterId)?.name
    : undefined;

  // Sidebar toggle styling
  const C = { border: 'rgba(127,176,105,0.25)', bg: '#0b0f0c', text: 'rgba(242,239,230,0.3)', gold: '#7fb069' };

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
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          {/* Back to landing */}
          <button
            onClick={() => setPage('landing')}
            style={{
              background: 'rgba(11,15,12,0.9)', border: '1px solid rgba(127,176,105,0.2)',
              color: 'rgba(242,239,230,0.4)', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.2em',
              padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(127,176,105,0.4)';
              (e.currentTarget as HTMLButtonElement).style.color = '#d8d2c2';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(127,176,105,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(242,239,230,0.4)';
            }}
          >
            ← 主页
          </button>
          {/* Chapter indicator (shown when a chapter is active) */}
          {activeChapter && (
            <div
              onClick={() => setShowChapters(true)}
              title="当前篇章"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', cursor: 'pointer',
                background: `${activeChapter.themeColor ?? '#ff6b1a'}15`,
                border: `1px solid ${activeChapter.themeColor ?? '#ff6b1a'}55`,
                color: activeChapter.themeColor ?? '#ff6b1a',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: '0.2em',
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
              background: 'rgba(11,15,12,0.9)', border: '1px solid rgba(127,176,105,0.25)',
              color: '#d8d2c2', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.2em',
              padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#7fb069';
              (e.currentTarget as HTMLButtonElement).style.color = '#7fb069';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(127,176,105,0.25)';
              (e.currentTarget as HTMLButtonElement).style.color = '#d8d2c2';
            }}
          >
            ◈ 篇章
          </button>

          {/* Theater mode */}
          <button
            onClick={() => setShowTheater(true)}
            style={{
              background: 'rgba(11,15,12,0.9)', border: '1px solid rgba(255,107,26,0.3)',
              color: '#ff8a3d', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.2em',
              padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff6b1a';
              (e.currentTarget as HTMLButtonElement).style.color = '#ff6b1a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,26,0.3)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ff8a3d';
            }}
          >
            ✦ 小剧场
          </button>

          {/* Light toggle */}
          <button
            onClick={() => setIsLightOn((v) => !v)}
            title={isLightOn ? '关灯' : '开灯'}
            style={{
              background: 'rgba(11,15,12,0.9)',
              border: `1px solid ${isLightOn ? 'rgba(255,107,26,0.5)' : 'rgba(127,176,105,0.2)'}`,
              color: isLightOn ? '#ff8a3d' : 'rgba(242,239,230,0.25)',
              cursor: 'pointer', fontSize: 14, width: 32, height: 32,
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
              background: 'rgba(11,15,12,0.9)', border: '1px solid rgba(127,176,105,0.2)',
              color: 'rgba(242,239,230,0.5)', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.2em',
              padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(127,176,105,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#d8d2c2';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(127,176,105,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(242,239,230,0.5)';
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
