import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { ItemType, CharacterProfile, EmotionKey } from '../types';
import { EMOTION_META, EMOTION_KEYS } from '../types';

interface Props {
  itemType: ItemType;
  onSave: (profile: CharacterProfile) => void;
  onClose: () => void;
}

const EMPTY: CharacterProfile = {
  name: '', coreIdentity: '', speechStyle: '',
  interactionLogic: '', notes: '', themeColor: '#b8a0e0',
};

const THEME_PRESETS = [
  '#b8a0e0', // 淡紫 (default)
  '#7a5090', // 暗紫 (阿伦)
  '#a03030', // 深红 (止水)
  '#4a8a6a', // 暗绿
  '#5a7aaa', // 钢蓝
  '#c8a030', // 金黄
  '#888888', // 灰
];

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 400;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = url;
  });
}

export default function CharacterProfileModal({ itemType, onSave, onClose }: Props) {
  const saved = itemType.characterProfile;
  const [profile, setProfile] = useState<CharacterProfile>(
    saved ?? { ...EMPTY, name: itemType.label }
  );
  const [uploadingEmotion, setUploadingEmotion] = useState<EmotionKey | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof CharacterProfile, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  function handleSave() {
    onSave(profile);
    onClose();
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadingEmotion) return;
    const compressed = await compressAvatar(file);
    setProfile((p) => ({
      ...p,
      avatarMap: { ...p.avatarMap, [uploadingEmotion]: compressed },
    }));
    setUploadingEmotion(null);
    e.target.value = '';
  }

  function removeAvatar(emotion: EmotionKey) {
    setProfile((p) => {
      const map = { ...p.avatarMap };
      delete map[emotion];
      return { ...p, avatarMap: map };
    });
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#0a0e16', color: '#c8c0a0',
    border: '1px solid #333', borderRadius: 4,
    padding: '8px 10px', fontSize: 12,
    lineHeight: 1.7, outline: 'none', fontFamily: 'inherit',
  };

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto', padding: '20px 0',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1e28', border: '2px solid #b8a0e0',
          borderRadius: 8, padding: 24, width: 500, maxWidth: '92vw',
          boxShadow: '0 0 30px rgba(184,160,224,0.2)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: '#b8a0e0', marginBottom: 20 }}>
          人物档案 — {itemType.label}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>姓名</div>
          <input
            value={profile.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例：宇智波止水"
            style={fieldStyle}
          />
        </div>

        {/* Theme color */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>角色主题色（对话框名牌颜色）</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {THEME_PRESETS.map((c) => (
              <div
                key={c}
                onClick={() => set('themeColor', c)}
                style={{
                  width: 22, height: 22, borderRadius: '50%', background: c,
                  cursor: 'pointer', flexShrink: 0,
                  border: profile.themeColor === c ? '2px solid #fff' : '2px solid transparent',
                  boxShadow: profile.themeColor === c ? '0 0 6px rgba(255,255,255,0.4)' : 'none',
                  transition: 'box-shadow 0.15s',
                }}
              />
            ))}
            <input
              type="color"
              value={profile.themeColor ?? '#b8a0e0'}
              onChange={(e) => set('themeColor', e.target.value)}
              title="自定义颜色"
              style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            />
          </div>
        </div>

        {/* Core Identity */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>核心身份设定</div>
          <textarea
            value={profile.coreIdentity}
            onChange={(e) => set('coreIdentity', e.target.value)}
            placeholder="例：宇智波幸存者，暗部成员，表面冷漠，情感深藏……"
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {/* Speech Style */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>语言风格参考</div>
          <textarea
            value={profile.speechStyle}
            onChange={(e) => set('speechStyle', e.target.value)}
            placeholder="例：话少，不废话，句子短。不用感叹号。偶尔反问……"
            rows={2}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {/* Interaction Logic */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>互动逻辑</div>
          <textarea
            value={profile.interactionLogic}
            onChange={(e) => set('interactionLogic', e.target.value)}
            placeholder="例：不会主动示弱，但会用行动回应关心……"
            rows={2}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>其他补充</div>
          <textarea
            value={profile.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="例：禁止使用「我理解你的感受」之类的话……"
            rows={2}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {/* ── Avatar Map ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
            七情立绘映射
            <span style={{ color: '#444', marginLeft: 6 }}>（未上传的情感自动回退到平静默认图）</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOTION_KEYS.map((emotion) => {
              const { zh, emoji } = EMOTION_META[emotion];
              const imgUrl = profile.avatarMap?.[emotion];
              return (
                <div
                  key={emotion}
                  style={{
                    width: 72, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4,
                  }}
                >
                  {/* Preview */}
                  <div
                    onClick={() => { setUploadingEmotion(emotion); avatarInputRef.current?.click(); }}
                    title={`上传「${zh}」立绘`}
                    style={{
                      width: 60, height: 60, borderRadius: 4,
                      background: '#0a0e18',
                      border: `1px solid ${imgUrl ? '#4a3a6a' : '#2a2a3a'}`,
                      cursor: 'pointer', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl} alt={zh}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 22 }}>{emoji}</span>
                    )}
                    {/* Hover overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(100,60,140,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, fontSize: 18, color: '#fff',
                      transition: 'opacity 0.15s',
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}
                    >
                      +
                    </div>
                  </div>
                  {/* Label */}
                  <div style={{ fontSize: 10, color: '#776688', textAlign: 'center' }}>
                    {emotion === 'Default' ? `默认\n${emoji}` : `${zh} ${emoji}`}
                  </div>
                  {/* Remove button */}
                  {imgUrl && (
                    <button
                      onClick={() => removeAvatar(emotion)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#663333', fontSize: 10, cursor: 'pointer', padding: 0,
                      }}
                    >
                      移除
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <input
            ref={avatarInputRef}
            type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #444',
              color: '#888', cursor: 'pointer', fontSize: 12,
              padding: '7px 16px', borderRadius: 4,
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              background: '#2a1e3a', border: '1px solid #b8a0e0',
              color: '#d4c0f0', cursor: 'pointer', fontSize: 12,
              padding: '7px 16px', borderRadius: 4,
            }}
          >
            保存档案
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
