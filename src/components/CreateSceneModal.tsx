import { useState } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  existingNames: string[];
  onConfirm: (name: string) => void;
  onClose: () => void;
}

export default function CreateSceneModal({ existingNames, onConfirm, onClose }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) { setError('请输入场景名称'); return; }
    if (existingNames.includes(trimmed)) { setError('场景名称已存在'); return; }
    onConfirm(trimmed);
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
          borderRadius: 8, padding: 24, width: 320,
          boxShadow: '0 0 30px rgba(255,216,74,0.25)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: '#ffd84a', marginBottom: 16 }}>新建场景</div>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') onClose(); }}
          placeholder="场景名称"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#0e1218', color: '#e8e0c0',
            border: `1px solid ${error ? '#cc2222' : '#444'}`,
            borderRadius: 4, padding: '9px 12px',
            fontSize: 13, outline: 'none',
          }}
        />
        {error && <div style={{ fontSize: 12, color: '#ff6060', marginTop: 6 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #444',
              color: '#888', cursor: 'pointer',
              fontSize: 13, padding: '7px 14px', borderRadius: 4,
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              background: '#2a3a10', border: '1px solid #88aa22',
              color: '#ccee44', cursor: 'pointer',
              fontSize: 13, padding: '7px 14px', borderRadius: 4,
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
