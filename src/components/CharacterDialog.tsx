import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { GameItem, ItemType, EmotionKey } from '../types';
import { EMOTION_META, EMOTION_KEYS } from '../types';
import { getStyleLabel } from '../utils/anbuGenerator';

// ── Avatar resolution ─────────────────────────────────────────────────────────
// Priority chain: avatarMap[emotion] → avatarMap.Default → active pose → imageUrl
function resolveAvatar(emotion: EmotionKey, itemType: ItemType, item: GameItem): string | null {
  const map = itemType.characterProfile?.avatarMap;
  if (map?.[emotion]) return map[emotion]!;
  if (map?.Default) return map.Default!;
  const activePose = itemType.poses?.find((p) => p.id === item.currentPoseId) ?? itemType.poses?.[0];
  return activePose?.imageUrl ?? itemType.imageUrl ?? null;
}

function getActivePoseName(item: GameItem, itemType: ItemType): string | null {
  if (!itemType.poses?.length) return null;
  const pose = itemType.poses.find((p) => p.id === item.currentPoseId) ?? itemType.poses[0];
  return pose.name !== '默认' ? pose.name : null;
}

// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;     // display text (dialogue only)
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;     // raw JSON sent/received
}

interface Props {
  item: GameItem;
  itemType: ItemType;
  apiKey: string;
  onDelete: () => void;
  onClose: () => void;
}

export default function CharacterDialog({
  item, itemType, apiKey, onDelete, onClose,
}: Props) {
  const profile = itemType.characterProfile;
  const charName = profile?.name || item.label;
  const themeColor = profile?.themeColor ?? '#b8a0e0';

  const [messages, setMessages] = useState<Message[]>([]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [styleWeight, setStyleWeight] = useState(0.4);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionKey>('Default');
  const [avatarVisible, setAvatarVisible] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAvatarVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  // Switch emotion whenever avatar src changes to trigger smooth swap
  const avatarSrc = resolveAvatar(currentEmotion, itemType, item);
  const emotionMeta = EMOTION_META[currentEmotion];

  function buildSystemPrompt(): string {
    const v = styleWeight;
    const toneInstruction =
      v < 0.33
        ? '【对话风格：文学化】用意象和留白代替直白表达。多用短句、停顿、省略号。情绪藏在动作细节里，不直接说破。禁止口语化。'
        : v <= 0.66
        ? '【对话风格：克制直接】一针见血，不废话。尽量短，每句话都有用。偶尔沉默或反问，用具体动作或事实说话。'
        : '【对话风格：冷幽默】用干涩反讽和意外比喻回应。偶尔接地气地吐槽，带漫不经心的嘲讽。禁止煽情。';

    const profileBlock = profile
      ? [
          `姓名：${profile.name || charName}`,
          profile.coreIdentity ? `核心身份设定：${profile.coreIdentity}` : '',
          profile.speechStyle ? `语言风格参考：${profile.speechStyle}` : '',
          profile.interactionLogic ? `互动逻辑：${profile.interactionLogic}` : '',
          profile.notes ? `其他补充：${profile.notes}` : '',
        ].filter(Boolean).join('\n')
      : `姓名：${charName}`;

    const poseName = getActivePoseName(item, itemType);
    const poseNote = poseName
      ? `当前姿态：「${poseName}」，请在动作描写中体现。\n`
      : '';

    const emotionList = EMOTION_KEYS.filter((k) => k !== 'Default')
      .map((k) => `${k}（${EMOTION_META[k].zh}）`).join(' | ');

    return [
      `你正在扮演角色「${charName}」。`,
      '',
      '【角色档案】',
      profileBlock,
      '',
      toneInstruction,
      '上方风格指令优先级高于语言风格参考。',
      '',
      poseNote + '【七情输出规则】',
      `每次回复必须是且仅是一个纯 JSON 对象，不含 Markdown 代码块或反引号。`,
      `格式：{"emotion":"...","dialogue":"..."}`,
      `emotion 从以下七情中选一个最贴合当前情绪的：${emotionList}`,
      `如果角色当前处于平静或无明显情绪波动，使用 Default。`,
      `情感的具体表现应符合角色个性——同样是「Joy（喜）」，内敛的角色可能是一声轻哼，外放的角色可能会放声大笑。`,
      `dialogue 是角色的台词，第一人称，100字以内，不含任何前缀标签。`,
    ].join('\n');
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;
    setErrorMsg('');

    if (!apiKey) {
      setErrorMsg('请先在 ⚙ 设置 中填写 DeepSeek API Key');
      return;
    }

    const userDisplayMsg: Message = { role: 'user', content: text };
    const userApiMsg: ApiMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userDisplayMsg];
    const updatedApiHistory = [...apiHistory, userApiMsg];

    setMessages([...updatedMessages, { role: 'assistant', content: '…' }]);
    setInput('');
    setIsSending(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/deepseek/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 300,
          temperature: 0.9,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...updatedApiHistory.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API 错误 ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const rawContent: string = data.choices?.[0]?.message?.content ?? '{}';

      let emotion: EmotionKey = 'Default';
      let dialogue = '…';
      try {
        const parsed = JSON.parse(rawContent);
        dialogue = typeof parsed.dialogue === 'string' ? parsed.dialogue : rawContent;
        const emo = parsed.emotion as string;
        if (emo && (EMOTION_KEYS as string[]).includes(emo)) emotion = emo as EmotionKey;
      } catch {
        dialogue = rawContent;
      }

      setCurrentEmotion(emotion);
      setMessages([...updatedMessages, { role: 'assistant', content: dialogue }]);
      setApiHistory([...updatedApiHistory, { role: 'assistant', content: rawContent }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages(updatedMessages);
      setApiHistory(updatedApiHistory);
      setErrorMsg(err instanceof Error ? err.message : '发送失败，请重试');
    } finally {
      setIsSending(false);
    }
  }

  const sliderLabel = getStyleLabel(styleWeight);
  const sliderPct = styleWeight * 100;

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'row',
          width: 900, maxWidth: '96vw', maxHeight: '92vh',
          background: '#14161f', border: `2px solid ${themeColor}44`,
          borderRadius: 10, overflow: 'hidden',
          boxShadow: `0 0 60px ${themeColor}22, 0 8px 32px rgba(0,0,0,0.6)`,
        }}
      >
        {/* ── Left: Avatar pane ─────────────────────────────────────────── */}
        <div
          style={{
            width: 260, flexShrink: 0,
            background: `linear-gradient(to bottom, #0a0614 0%, #0e0a1a 100%)`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRight: `1px solid ${themeColor}22`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            padding: '0 0 14px',
            position: 'relative',
            transform: avatarVisible ? 'translateX(0)' : 'translateX(-50px)',
            opacity: avatarVisible ? 1 : 0,
            transition: 'transform 0.40s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease',
          }}
        >
          {/* Portrait */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {avatarSrc ? (
              <img
                key={avatarSrc}     // key forces re-mount for CSS fade on swap
                src={avatarSrc}
                alt={charName}
                style={{
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain', objectPosition: 'bottom center',
                  display: 'block',
                  animation: 'fadeIn 0.25s ease',
                  filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                }}
              />
            ) : (
              <div style={{
                fontSize: 60, lineHeight: 1, marginBottom: 50,
                filter: `drop-shadow(0 0 14px ${themeColor}88)`,
                transition: 'all 0.25s ease',
              }}>
                {emotionMeta.emoji}
              </div>
            )}
          </div>


          {/* Bottom gradient */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
            background: 'linear-gradient(to top, rgba(8,4,18,0.98) 0%, transparent 100%)',
            zIndex: 1,
          }} />

          {/* Character name tag + emotion badge */}
          <div style={{
            position: 'relative', zIndex: 2, textAlign: 'center',
            width: '100%', padding: '0 10px', boxSizing: 'border-box',
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: themeColor,
              textShadow: `0 0 12px ${themeColor}66`,
              marginBottom: 4, letterSpacing: 1,
            }}>
              {charName}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              borderRadius: 4, padding: '2px 7px',
              border: `1px solid ${themeColor}33`,
              marginBottom: avatarSrc ? 0 : 6,
            }}>
              <span style={{ fontSize: 13 }}>{emotionMeta.emoji}</span>
              <span style={{ fontSize: 10, color: themeColor }}>{emotionMeta.zh}</span>
            </div>
            {!avatarSrc && (
              <div style={{ marginTop: 4 }} />
            )}
          </div>
        </div>

        {/* ── Right: Dialog area ────────────────────────────────────────── */}
        <div style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '18px 20px',
        }}>
          {/* Header */}
          <div style={{ flexShrink: 0, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: themeColor }}>
              与 {charName} 对话
            </div>
            {profile?.coreIdentity ? (
              <div style={{ fontSize: 10, color: '#554466', marginTop: 3 }}>
                {profile.coreIdentity.slice(0, 56)}{profile.coreIdentity.length > 56 ? '…' : ''}
              </div>
            ) : (
              <div style={{ fontSize: 10, color: '#553333', marginTop: 3 }}>
                ⚠ 尚未填写人设档案，建议先在右侧栏 ⋯ 菜单中编辑人设
              </div>
            )}
          </div>

          {/* Style slider */}
          <div style={{ marginBottom: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: '#5566aa' }}>文学化</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: styleWeight < 0.4 ? '#7aabdd' : styleWeight > 0.6 ? '#ffd84a' : '#8899bb' }}>
                {sliderLabel}
              </span>
              <span style={{ fontSize: 10, color: '#997722' }}>冷幽默</span>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              value={Math.round(styleWeight * 100)}
              onChange={(e) => setStyleWeight(Number(e.target.value) / 100)}
              style={{
                width: '100%', height: 4,
                appearance: 'none', outline: 'none',
                background: `linear-gradient(to right, #4a6e9a 0%, #6688bb ${sliderPct}%, #1e2030 ${sliderPct}%, #1e2030 100%)`,
                borderRadius: 3, cursor: 'pointer',
              }}
            />
          </div>

          {/* Conversation log */}
          <div
            ref={logRef}
            style={{
              flex: 1, overflowY: 'auto', minHeight: 140,
              background: '#0a0c14', borderRadius: 6, padding: '10px 12px',
              marginBottom: 10, border: '1px solid #181620',
            }}
          >
            {messages.length === 0 && (
              <div style={{ fontSize: 12, color: '#252035', textAlign: 'center', marginTop: 28 }}>
                开始对话……
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: 8, display: 'flex',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: 6, alignItems: 'flex-start',
              }}>
                <div style={{
                  fontSize: 12,
                  color: m.role === 'user' ? '#9aacbb' : '#c4aee0',
                  background: m.role === 'user' ? '#1a2230' : '#1a1428',
                  border: `1px solid ${m.role === 'user' ? '#243040' : themeColor + '33'}`,
                  borderRadius: 6, padding: '6px 10px',
                  maxWidth: '84%', lineHeight: 1.75, whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ fontSize: 11, color: '#ff6060', marginBottom: 6, flexShrink: 0 }}>
              {errorMsg}
            </div>
          )}

          {/* Input row */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="你想说的话…"
              disabled={isSending}
              style={{
                flex: 1, background: '#0c0e18', color: '#d8d0c0',
                border: `1px solid ${themeColor}33`, borderRadius: 4,
                padding: '7px 11px', fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              style={{
                background: isSending ? '#12101a' : '#1e1430',
                border: `1px solid ${isSending ? '#2a2a3a' : themeColor}`,
                color: isSending ? '#443355' : themeColor,
                cursor: isSending ? 'not-allowed' : 'pointer',
                fontSize: 12, padding: '7px 14px', borderRadius: 4, flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {isSending ? '…' : '发送'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexShrink: 0 }}>
            <button
              onClick={() => { onDelete(); onClose(); }}
              style={{
                background: '#2a1010', border: '1px solid #882222',
                color: '#cc5050', cursor: 'pointer', fontSize: 11,
                padding: '5px 10px', borderRadius: 4,
              }}
            >
              删除人物
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid #2a2a3a',
                color: '#556', cursor: 'pointer', fontSize: 11,
                padding: '5px 10px', borderRadius: 4,
              }}
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe for avatar swap fade */}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>,
    document.body
  );
}
