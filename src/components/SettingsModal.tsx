import { useState } from 'react';
import ReactDOM from 'react-dom';

const DEFAULT_SYSTEM_PROMPT =
  '你是《人间未满》同人小说的叙事者。主角阿伦（赤盏伦）情感钝感、' +
  '行事直觉性，与宇智波止水之间是纠缠依存而非浪漫爱情的关系。' +
  '请用第三人称叙述风格按照提示续写物品背景，30字以内。';

interface Props {
  apiKey: string;
  aiSystemPrompt: string;
  onSave: (apiKey: string, systemPrompt: string) => void;
  onClose: () => void;
}

export default function SettingsModal({ apiKey, aiSystemPrompt, onSave, onClose }: Props) {
  const [key, setKey] = useState(apiKey);
  const [prompt, setPrompt] = useState(aiSystemPrompt || DEFAULT_SYSTEM_PROMPT);

  function handleSave() {
    onSave(key.trim(), prompt.trim());
    onClose();
  }

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1e28', border: '2px solid #ffd84a',
          borderRadius: 8, padding: 24, width: 480, maxWidth: '90vw',
          boxShadow: '0 0 30px rgba(255,216,74,0.25)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: '#ffd84a', marginBottom: 20 }}>
          设置
        </div>

        {/* API Key */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>
            DeepSeek API Key
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#0e1218', color: '#e8e0c0',
              border: '1px solid #444', borderRadius: 4,
              padding: '8px 12px', fontSize: 13, outline: 'none',
              fontFamily: 'monospace',
            }}
          />
          <div style={{ fontSize: 10, color: '#446', marginTop: 4 }}>
            Key 仅存储在本地 IndexedDB，不会上传到任何服务器
          </div>
        </div>

        {/* System Prompt */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>
            世界观 / 角色设定（系统 Prompt）
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#0a0e16', color: '#c8c0a0',
              border: '1px solid #333', borderRadius: 4,
              padding: '8px 10px', fontSize: 12,
              lineHeight: 1.75, resize: 'vertical', outline: 'none',
            }}
          />
        </div>

        {/* Footer */}
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
              background: '#2a3a10', border: '1px solid #88aa22',
              color: '#ccee44', cursor: 'pointer', fontSize: 12,
              padding: '7px 16px', borderRadius: 4,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
