import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import type { GameState, GameItem, ItemType, Scene, SceneNote, CharacterProfile, CharacterPose } from '../types';
import { CANVAS_W, CANVAS_H } from '../types';
import { BUILTIN_SCENES } from '../constants/scenes';
import { BUILTIN_ITEM_TYPES, BUILTIN_ITEMS } from '../constants/items';

localforage.config({ name: 'ningen-iman-game', storeName: 'gamestate' });

const AI_PROMPT_KEY = 'ai-system-prompt';
const API_KEY_KEY = 'deepseek-api-key';

function getInitialState(): GameState {
  return {
    scenes: BUILTIN_SCENES,
    items: BUILTIN_ITEMS,
    itemTypes: BUILTIN_ITEM_TYPES,
    activeSceneId: BUILTIN_SCENES[0].id,
    selectedItemId: null,
    chapters: [],
    activeChapterId: null,
  };
}

function mergeWithDefaults(saved: Partial<GameState>): GameState {
  const initial = getInitialState();

  // Ensure built-in scenes exist
  const savedSceneIds = new Set((saved.scenes ?? []).map((s) => s.id));
  const missingScenes = initial.scenes.filter((s) => !savedSceneIds.has(s.id));

  // Ensure built-in item types exist
  const savedTypeIds = new Set((saved.itemTypes ?? []).map((t) => t.id));
  const missingTypes = initial.itemTypes.filter((t) => !savedTypeIds.has(t.id));

  // Ensure built-in items exist
  const savedItemIds = new Set((saved.items ?? []).map((i) => i.id));
  const missingItems = initial.items.filter((i) => !savedItemIds.has(i.id));

  // Migrate old items that lack rotation/flipX fields
  const migratedItems = (saved.items ?? []).map((i) => ({
    ...i,
    rotation: i.rotation ?? 0,
    flipX: i.flipX ?? false,
  }));

  const migratedTypes = (saved.itemTypes ?? []).map((t) => {
    let base = { ...t, category: t.category ?? 'item' };
    // Migrate character types: if they have imageUrl but no poses, create default pose
    if (base.category === 'character' && base.imageUrl && !base.poses?.length) {
      base = {
        ...base,
        poses: [{ id: `pose-default-${base.id}`, name: '默认', imageUrl: base.imageUrl }],
      };
    }
    // Migrate legacy avatarUrl → avatarMap.Default
    if (base.characterProfile?.avatarUrl && !base.characterProfile.avatarMap?.Default) {
      base = {
        ...base,
        characterProfile: {
          ...base.characterProfile,
          avatarMap: { Default: base.characterProfile.avatarUrl },
        },
      };
    }
    return base;
  });

  return {
    scenes: [...missingScenes, ...(saved.scenes ?? [])],
    items: [...missingItems, ...migratedItems],
    itemTypes: [...missingTypes, ...migratedTypes],
    activeSceneId: saved.activeSceneId ?? initial.activeSceneId,
    selectedItemId: null,
    chapters: saved.chapters ?? [],
    activeChapterId: saved.activeChapterId ?? null,
  };
}

export function useGameStore() {
  const [state, setState] = useState<GameState>(getInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [aiSystemPrompt, setAiSystemPromptState] = useState('');
  const [apiKey, setApiKeyState] = useState('');

  // Load from IndexedDB on mount
  useEffect(() => {
    localforage.getItem<GameState>('state').then((saved) => {
      if (saved) setState(mergeWithDefaults(saved));
      setHydrated(true);
    });
    localforage.getItem<string>(AI_PROMPT_KEY).then((val) => {
      if (val) setAiSystemPromptState(val);
    });
    localforage.getItem<string>(API_KEY_KEY).then((val) => {
      if (val) setApiKeyState(val);
    });
  }, []);

  // Persist to IndexedDB on every state change (after hydration)
  useEffect(() => {
    if (hydrated) localforage.setItem('state', state);
  }, [state, hydrated]);

  // ─── Scene mutations ───────────────────────────────────────────────────────

  const setActiveScene = useCallback((sceneId: string) => {
    setState((prev) => ({ ...prev, activeSceneId: sceneId, selectedItemId: null }));
  }, []);

  const addScene = useCallback((name: string) => {
    const newScene: Scene = {
      id: `scene-${crypto.randomUUID()}`,
      name,
      builtin: false,
      backgroundType: 'builtin',
      backgroundKey: 'anbu-locker',
    };
    setState((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
      activeSceneId: newScene.id,
    }));
  }, []);

  const updateSceneBackground = useCallback((sceneId: string, imageUrl: string) => {
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, backgroundType: 'image', backgroundImageUrl: imageUrl } : s
      ),
    }));
  }, []);

  const addSceneNote = useCallback((sceneId: string, note: SceneNote) => {
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, notes: [...(s.notes ?? []), note] } : s
      ),
    }));
  }, []);

  const updateSceneNote = useCallback((sceneId: string, note: SceneNote) => {
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId
          ? { ...s, notes: (s.notes ?? []).map((n) => (n.id === note.id ? note : n)) }
          : s
      ),
    }));
  }, []);

  const deleteSceneNote = useCallback((sceneId: string, noteId: string) => {
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId
          ? { ...s, notes: (s.notes ?? []).filter((n) => n.id !== noteId) }
          : s
      ),
    }));
  }, []);

  // ── Chapter mutations ──────────────────────────────────────────────────────
  const addChapter = useCallback((chapter: import('../types').Chapter) => {
    setState((prev) => ({ ...prev, chapters: [...prev.chapters, chapter] }));
  }, []);

  const updateChapter = useCallback((chapter: import('../types').Chapter) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) => (c.id === chapter.id ? chapter : c)),
    }));
  }, []);

  const deleteChapter = useCallback((chapterId: string) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((c) => c.id !== chapterId),
      activeChapterId: prev.activeChapterId === chapterId ? null : prev.activeChapterId,
    }));
  }, []);

  const setActiveChapter = useCallback((chapterId: string | null) => {
    setState((prev) => ({ ...prev, activeChapterId: chapterId }));
  }, []);

  // ─── Item mutations ────────────────────────────────────────────────────────

  const setSelectedItem = useCallback((itemId: string | null) => {
    setState((prev) => ({ ...prev, selectedItemId: itemId }));
  }, []);

  const bringToFront = useCallback((itemId: string) => {
    setState((prev) => {
      const sceneItems = prev.items.filter((i) => i.sceneId === prev.activeSceneId && !i.trashed);
      const maxZ = sceneItems.length > 0 ? Math.max(...sceneItems.map((i) => i.zIndex)) : 0;
      return {
        ...prev,
        items: prev.items.map((i) => (i.id === itemId ? { ...i, zIndex: maxZ + 1 } : i)),
      };
    });
  }, []);

  const updateItemPosition = useCallback((itemId: string, xPct: number, yPct: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, xPct, yPct } : i)),
    }));
  }, []);

  const updateItemGeometry = useCallback(
    (itemId: string, xPct: number, yPct: number, wPct: number, hPct: number) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, xPct, yPct, wPct, hPct } : i
        ),
      }));
    },
    []
  );

  const updateItemTransform = useCallback((itemId: string, rotation: number, flipX: boolean) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, rotation, flipX } : i)),
    }));
  }, []);

  const updateItemDescription = useCallback((itemId: string, description: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, description } : i)),
    }));
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, trashed: true } : i)),
      selectedItemId: prev.selectedItemId === itemId ? null : prev.selectedItemId,
    }));
  }, []);

  const restoreItem = useCallback((itemId: string) => {
    setState((prev) => {
      const item = prev.items.find((i) => i.id === itemId);
      if (!item) return prev;
      const cx = 0.5 - item.wPct / 2;
      const cy = 0.5 - item.hPct / 2;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId
            ? { ...i, trashed: false, sceneId: prev.activeSceneId, xPct: cx, yPct: cy }
            : i
        ),
      };
    });
  }, []);

  const addItemToScene = useCallback((itemType: ItemType) => {
    setState((prev) => {
      const sceneItems = prev.items.filter((i) => i.sceneId === prev.activeSceneId && !i.trashed);
      const maxZ = sceneItems.length > 0 ? Math.max(...sceneItems.map((i) => i.zIndex)) : 0;
      const wPct = itemType.defaultWidth / CANVAS_W;
      const hPct = itemType.defaultHeight / CANVAS_H;
      const newItem: GameItem = {
        id: `item-${crypto.randomUUID()}`,
        sceneId: prev.activeSceneId,
        itemTypeId: itemType.id,
        label: itemType.label,
        description: '',
        xPct: 0.5 - wPct / 2,
        yPct: 0.5 - hPct / 2,
        wPct,
        hPct,
        zIndex: maxZ + 1,
        trashed: false,
        rotation: 0,
        flipX: false,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  }, []);

  // Rename a GameItem (used for stashed items)
  const renameItem = useCallback((itemId: string, label: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, label } : i)),
    }));
  }, []);

  // Permanently remove a GameItem from state (hard delete from stash)
  const permanentlyDeleteItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
      selectedItemId: prev.selectedItemId === itemId ? null : prev.selectedItemId,
    }));
  }, []);

  // Rename an ItemType (also syncs label on all GameItems that use it)
  const renameItemType = useCallback((typeId: string, label: string) => {
    setState((prev) => ({
      ...prev,
      itemTypes: prev.itemTypes.map((t) => (t.id === typeId ? { ...t, label } : t)),
      items: prev.items.map((i) => (i.itemTypeId === typeId ? { ...i, label } : i)),
    }));
  }, []);

  // Delete an ItemType and all GameItems that reference it
  const deleteItemType = useCallback((typeId: string) => {
    setState((prev) => ({
      ...prev,
      itemTypes: prev.itemTypes.filter((t) => t.id !== typeId),
      items: prev.items.filter((i) => i.itemTypeId !== typeId),
    }));
  }, []);

  const addCharacterPose = useCallback((typeId: string, pose: CharacterPose) => {
    setState((prev) => ({
      ...prev,
      itemTypes: prev.itemTypes.map((t) =>
        t.id === typeId ? { ...t, poses: [...(t.poses ?? []), pose] } : t
      ),
    }));
  }, []);

  const removeCharacterPose = useCallback((typeId: string, poseId: string) => {
    setState((prev) => ({
      ...prev,
      itemTypes: prev.itemTypes.map((t) =>
        t.id === typeId ? { ...t, poses: (t.poses ?? []).filter((p) => p.id !== poseId) } : t
      ),
      // If any item was on this pose, reset to first pose
      items: prev.items.map((i) =>
        i.itemTypeId === typeId && i.currentPoseId === poseId
          ? { ...i, currentPoseId: undefined }
          : i
      ),
    }));
  }, []);

  const setItemPose = useCallback((itemId: string, poseId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, currentPoseId: poseId } : i)),
    }));
  }, []);

  const updateCharacterProfile = useCallback((typeId: string, profile: CharacterProfile) => {
    setState((prev) => ({
      ...prev,
      itemTypes: prev.itemTypes.map((t) =>
        t.id === typeId ? { ...t, characterProfile: profile } : t
      ),
    }));
  }, []);

  const addImageItemType = useCallback((
    label: string,
    imageUrl: string,
    category: 'item' | 'character' = 'item',
  ): ItemType => {
    const typeId = `type-${crypto.randomUUID()}`;
    const newType: ItemType = {
      id: typeId,
      label,
      kind: 'image',
      category,
      imageUrl,
      poses: category === 'character'
        ? [{ id: `pose-default-${typeId}`, name: '默认', imageUrl }]
        : undefined,
      defaultWidth: category === 'character' ? 200 : 160,
      defaultHeight: category === 'character' ? 320 : 160,
    };
    setState((prev) => ({ ...prev, itemTypes: [...prev.itemTypes, newType] }));
    return newType;
  }, []);

  // ─── AI Prompt ────────────────────────────────────────────────────────────

  const saveAiSystemPrompt = useCallback((prompt: string) => {
    setAiSystemPromptState(prompt);
    localforage.setItem(AI_PROMPT_KEY, prompt);
  }, []);

  const saveApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localforage.setItem(API_KEY_KEY, key);
  }, []);

  return {
    state,
    hydrated,
    aiSystemPrompt,
    saveAiSystemPrompt,
    apiKey,
    saveApiKey,
    setActiveScene,
    addScene,
    updateSceneBackground,
    addSceneNote,
    updateSceneNote,
    deleteSceneNote,
    setSelectedItem,
    bringToFront,
    updateItemPosition,
    updateItemGeometry,
    updateItemTransform,
    updateItemDescription,
    deleteItem,
    restoreItem,
    addItemToScene,
    addImageItemType,
    renameItem,
    permanentlyDeleteItem,
    addCharacterPose,
    removeCharacterPose,
    setItemPose,
    updateCharacterProfile,
    renameItemType,
    deleteItemType,
    addChapter,
    updateChapter,
    deleteChapter,
    setActiveChapter,
  };
}
