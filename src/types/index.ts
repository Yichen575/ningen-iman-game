export interface SceneNote {
  id: string;
  chapter: string;
  summary: string;
  createdAt: number;
}

export interface Scene {
  id: string;
  name: string;
  builtin?: boolean;
  backgroundType: 'builtin' | 'image';
  backgroundKey?: string;
  backgroundImageUrl?: string;
  notes?: SceneNote[];   // replaces old string notes
}

export interface GameItem {
  id: string;
  sceneId: string;
  itemTypeId: string;
  label: string;
  description: string;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  zIndex: number;
  trashed: boolean;
  rotation: number;       // degrees, -180..180, default 0
  flipX: boolean;         // horizontal mirror, default false
  currentPoseId?: string; // active pose for character items
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  backgroundUrl?: string;         // overrides active scene background
  allowedCharacters: string[];    // itemType IDs; empty array = all allowed
  systemPromptModifier: string;   // injected into AI system prompt
  themeColor?: string;            // card accent color in UI
}

// ── Seven Emotions (七情) ──────────────────────────────────────────────────
export type EmotionKey = 'Default' | 'Joy' | 'Anger' | 'Sorrow' | 'Fear' | 'Love' | 'Hate' | 'Desire';

export const EMOTION_META: Record<EmotionKey, { zh: string; emoji: string }> = {
  Default: { zh: '平静', emoji: '😐' },
  Joy:     { zh: '喜',   emoji: '🙂' },
  Anger:   { zh: '怒',   emoji: '😠' },
  Sorrow:  { zh: '哀',   emoji: '😔' },
  Fear:    { zh: '惧',   emoji: '😨' },
  Love:    { zh: '爱',   emoji: '🫀' },
  Hate:    { zh: '恶',   emoji: '💢' },
  Desire:  { zh: '欲',   emoji: '🔥' },
};

export const EMOTION_KEYS: EmotionKey[] = ['Default', 'Joy', 'Anger', 'Sorrow', 'Fear', 'Love', 'Hate', 'Desire'];
// ──────────────────────────────────────────────────────────────────────────────

export interface CharacterProfile {
  name: string;
  coreIdentity: string;
  speechStyle: string;
  interactionLogic: string;
  notes: string;
  themeColor?: string;                              // hex color for name tag, e.g. '#7a5090'
  avatarMap?: Partial<Record<EmotionKey, string>>;  // emotion → imageUrl
  /** @deprecated use avatarMap.Default instead */
  avatarUrl?: string;
}

export interface CharacterPose {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ItemType {
  id: string;
  label: string;
  kind: 'svg' | 'image';
  category: 'item' | 'character';  // default 'item'
  svgKey?: string;
  imageUrl?: string;
  poses?: CharacterPose[];          // character only; first pose = default
  defaultWidth: number;
  defaultHeight: number;
  characterProfile?: CharacterProfile;
}

export interface GameState {
  scenes: Scene[];
  items: GameItem[];
  itemTypes: ItemType[];
  activeSceneId: string;
  selectedItemId: string | null;
  chapters: Chapter[];
  activeChapterId: string | null;
}

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

export const CANVAS_W = 1440;
export const CANVAS_H = 900;
