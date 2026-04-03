import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { GameState, ItemType, EmotionKey } from '../types';
import { EMOTION_META, EMOTION_KEYS } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ScriptLine {
  name: string;
  emotion: EmotionKey;
  text: string;
}

function resolveAvatar(emotion: EmotionKey, t: ItemType): string | null {
  const map = t.characterProfile?.avatarMap;
  if (map?.[emotion]) return map[emotion]!;
  if (map?.Default) return map.Default!;
  const pose = t.poses?.find((p) => p.id) ?? t.poses?.[0];
  return pose?.imageUrl ?? t.imageUrl ?? null;
}

function charName(t: ItemType): string {
  return t.characterProfile?.name || t.label;
}

function charColor(t: ItemType): string {
  return t.characterProfile?.themeColor ?? '#b8a0e0';
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  state: GameState;
  apiKey: string;
  onClose: () => void;
}

const NAV_BTN: React.CSSProperties = {
  background: '#0c0a16', border: '1px solid #221a32',
  color: '#887799', cursor: 'pointer', fontSize: 12,
  padding: '5px 10px', borderRadius: 4, flexShrink: 0,
  transition: 'color 0.15s, border-color 0.15s',
};

export default function TheaterMode({ state, apiKey, onClose }: Props) {
  const allChars = state.itemTypes.filter(
    (t) => t.kind === 'image' && t.category === 'character'
  );

  // ── State ─────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<'select' | 'stage'>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [lineCount, setLineCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [script, setScript] = useState<ScriptLine[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedChars = selectedIds
    .map((id) => allChars.find((c) => c.id === id))
    .filter((c): c is ItemType => !!c);

  const currentScriptLine = script[currentLine] ?? null;
  const activeSpeaker = currentScriptLine
    ? (selectedChars.find((c) => charName(c) === currentScriptLine.name) ?? null)
    : null;

  // ── Auto-play ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAutoPlay && script.length > 0) {
      autoTimerRef.current = setInterval(() => {
        setCurrentLine((prev) => {
          if (prev >= script.length - 1) {
            setIsAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2800);
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isAutoPlay, script.length]);

  // ── Callbacks ─────────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  }

  async function generate() {
    if (!apiKey) { setErrorMsg('请先在 ⚙ 设置 中填写 DeepSeek API Key'); return; }
    if (selectedChars.length < 2) { setErrorMsg('请至少选择两个角色'); return; }
    setErrorMsg('');
    setIsGenerating(true);

    const profileBlocks = selectedChars.map((t) => {
      const p = t.characterProfile;
      const name = charName(t);
      if (!p) return `【${name}】（无档案）`;
      return [
        `【${name}】`,
        p.coreIdentity ? `核心身份：${p.coreIdentity}` : '',
        p.speechStyle ? `语言风格：${p.speechStyle}` : '',
        p.interactionLogic ? `互动逻辑：${p.interactionLogic}` : '',
        p.notes ? `补充：${p.notes}` : '',
      ].filter(Boolean).join('\n');
    }).join('\n\n');

    const names = selectedChars.map(charName).join('、');
    const emotionGuide = EMOTION_KEYS
      .filter((k) => k !== 'Default')
      .map((k) => `${k}(${EMOTION_META[k].zh})`)
      .join(' | ');

    const systemPrompt = [
      '你是专业的视觉小说剧本导演，擅长根据人物设定创作有张力、情感起伏鲜明的对话。',
      '',
      '【登场角色档案】',
      profileBlocks,
      '',
      '【七情情感参考】',
      emotionGuide + ' | Default(平静)',
      '请根据角色性格与当前台词内容，为每句话选择最贴合的情感——',
      '同样是喜(Joy)，内敛角色可能只是嘴角微扬，外放角色可能开怀大笑。',
      '',
      '【输出格式（严格遵守）】',
      '返回一个纯 JSON 对象（不含任何 Markdown 代码块或反引号）：',
      '{"lines":[{"name":"角色名","emotion":"情感key","text":"台词"}]}',
      `name 必须是以下之一：${names}`,
      'emotion 必须是七情英文 key（Joy/Anger/Sorrow/Fear/Love/Hate/Desire）或 Default。',
      'text 每条不超过 60 字，第一人称，不含任何括号标注。',
    ].join('\n');

    const userPrompt = [
      `场景前提：${context || '自由发挥，体现角色之间的关系张力'}`,
      `请为 ${names} 创作一段对话，共约 ${lineCount} 条台词。`,
      '要求：严格遵守各自人设，台词有起伏，情感变化自然，角色声音鲜明可辨。',
    ].join('\n');

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/deepseek/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 2500,
          temperature: 0.95,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`API 错误 ${res.status}: ${await res.text()}`);

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      const arr: unknown[] = Array.isArray(parsed) ? parsed : (parsed.lines ?? []);

      const lines: ScriptLine[] = arr
        .filter((l): l is Record<string, unknown> =>
          typeof l === 'object' && l !== null &&
          typeof (l as Record<string, unknown>).name === 'string' &&
          typeof (l as Record<string, unknown>).text === 'string'
        )
        .map((l) => ({
          name: l.name as string,
          emotion: (EMOTION_KEYS as string[]).includes(l.emotion as string)
            ? (l.emotion as EmotionKey)
            : 'Default' as EmotionKey,
          text: l.text as string,
        }));

      if (lines.length === 0) throw new Error('生成结果为空，请重试');
      setScript(lines);
      setCurrentLine(0);
      setIsAutoPlay(false);
      setPhase('stage');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setErrorMsg(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }

  function exportScript() {
    const title = context || '小剧场';
    const body = script
      .map((l) => `${l.name}（${EMOTION_META[l.emotion].zh}）：${l.text}`)
      .join('\n');
    const text = `=== ${title} ===\n\n${body}\n\n=== END ===`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  }

  // ── Phase: Select ─────────────────────────────────────────────────────────
  if (phase === 'select') {
    return ReactDOM.createPortal(
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#11131c', border: '2px solid #2e1e4e',
            borderRadius: 10, padding: '28px 28px 24px', width: 520, maxWidth: '92vw',
            boxShadow: '0 0 60px rgba(100,60,180,0.18)',
          }}
        >
          {/* Title */}
          <div style={{ fontSize: 16, fontWeight: 700, color: '#c8a0f0', marginBottom: 4 }}>
            ✦ 小剧场模式
          </div>
          <div style={{ fontSize: 11, color: '#3a2a4a', marginBottom: 22 }}>
            选择角色，输入前提，让 AI 生成一段剧本
          </div>

          {/* Character selection */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#6a5a7a', marginBottom: 8 }}>
              登场角色（至少 2 个，最多 4 个）
            </div>
            {allChars.length === 0 ? (
              <div style={{ fontSize: 12, color: '#3a2a3a', padding: '12px 0' }}>
                尚未上传任何人物素材，请先在右侧栏上传人物立绘。
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allChars.map((t) => {
                  const sel = selectedIds.includes(t.id);
                  const color = charColor(t);
                  const avatar =
                    t.characterProfile?.avatarMap?.Default ??
                    t.poses?.[0]?.imageUrl ?? t.imageUrl;
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleSelect(t.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 12px 7px 8px', borderRadius: 6, cursor: 'pointer',
                        background: sel ? `${color}1a` : '#0c0e18',
                        border: `1.5px solid ${sel ? color : '#221a32'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {avatar && (
                        <img src={avatar} alt="" style={{
                          width: 34, height: 34, objectFit: 'contain',
                          borderRadius: 3, background: '#080a12', flexShrink: 0,
                        }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: sel ? 600 : 400,
                          color: sel ? color : '#887799',
                        }}>
                          {charName(t)}
                        </div>
                        {t.characterProfile?.coreIdentity && (
                          <div style={{
                            fontSize: 10, color: '#3a2a4a', maxWidth: 140,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {t.characterProfile.coreIdentity.slice(0, 22)}
                          </div>
                        )}
                      </div>
                      {sel && (
                        <div style={{ marginLeft: 4, fontSize: 11, color: `${color}bb`, flexShrink: 0 }}>
                          #{selectedIds.indexOf(t.id) + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Context */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#6a5a7a', marginBottom: 6 }}>场景前提（选填）</div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="例：雨夜，止水在暗部档案室意外遇到了阿伦……"
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#0a0c16', color: '#b8b0a0',
                border: '1px solid #1e1630', borderRadius: 4,
                padding: '8px 10px', fontSize: 12, outline: 'none',
                lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Line count */}
          <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, color: '#6a5a7a', flexShrink: 0 }}>对话条数</div>
            <input
              type="range" min={6} max={20} step={2} value={lineCount}
              onChange={(e) => setLineCount(Number(e.target.value))}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <div style={{ fontSize: 12, color: '#998aaa', width: 24, textAlign: 'right', flexShrink: 0 }}>
              {lineCount}
            </div>
          </div>

          {errorMsg && (
            <div style={{ fontSize: 11, color: '#ff6060', marginBottom: 12 }}>{errorMsg}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onClose} style={{ ...NAV_BTN, padding: '7px 14px' }}>取消</button>
            <button
              onClick={generate}
              disabled={isGenerating || selectedIds.length < 2}
              style={{
                background: isGenerating || selectedIds.length < 2 ? '#12101e' : '#211438',
                border: `1px solid ${isGenerating || selectedIds.length < 2 ? '#2a1a4a' : '#7a50c0'}`,
                color: isGenerating || selectedIds.length < 2 ? '#3a2a5a' : '#c8a0f0',
                cursor: isGenerating || selectedIds.length < 2 ? 'not-allowed' : 'pointer',
                fontSize: 13, padding: '9px 22px', borderRadius: 5, fontWeight: 600,
              }}
            >
              {isGenerating ? '生成中…' : '✦ 生成剧本'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ── Phase: Stage ──────────────────────────────────────────────────────────
  const n = selectedChars.length;
  const currentEmotion = currentScriptLine?.emotion ?? 'Default';

  // Character layout positions (left% of stage, width%)
  const charLayout: Array<{ left: number; width: number; flip: boolean }> =
    n === 2
      ? [{ left: 2, width: 36, flip: false }, { left: 62, width: 36, flip: true }]
      : n === 3
      ? [
          { left: 0, width: 26, flip: false },
          { left: 37, width: 26, flip: false },
          { left: 74, width: 26, flip: true },
        ]
      : [
          { left: 0, width: 22, flip: false },
          { left: 26, width: 22, flip: false },
          { left: 52, width: 22, flip: true },
          { left: 78, width: 22, flip: true },
        ];

  // Spotlight X center per character
  const spotlightCenters = charLayout.map((c) => c.left + c.width / 2);

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#050308', display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, height: 44, padding: '0 16px',
        background: 'rgba(6,4,12,0.96)',
        borderBottom: '1px solid #100c1e',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9a70d0', flexShrink: 0 }}>
          ✦ 小剧场
        </div>
        <div style={{
          flex: 1, fontSize: 11, color: '#3a2a4a',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {context || '无标题'}
        </div>
        {/* Character name tags */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {selectedChars.map((t) => (
            <div key={t.id} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 3,
              background: `${charColor(t)}18`,
              border: `1px solid ${charColor(t)}44`,
              color: charColor(t),
            }}>
              {charName(t)}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#2a1e3a', flexShrink: 0 }}>
          {currentLine + 1} / {script.length}
        </div>
        <button
          onClick={() => { setPhase('select'); setIsAutoPlay(false); }}
          style={{ ...NAV_BTN, fontSize: 11, padding: '3px 10px' }}
        >
          重选
        </button>
        <button
          onClick={onClose}
          style={{ ...NAV_BTN, fontSize: 11, padding: '3px 8px', color: '#443355' }}
        >
          ✕
        </button>
      </div>

      {/* ── Stage area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Stage background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, #0f0820 0%, #050308 65%)',
        }} />

        {/* Spotlight cone for active speaker */}
        {activeSpeaker && (() => {
          const idx = selectedChars.indexOf(activeSpeaker);
          const spotX = spotlightCenters[idx] ?? 50;
          const color = charColor(activeSpeaker);
          return (
            <div style={{
              position: 'absolute', top: 0,
              left: `${spotX}%`, transform: 'translateX(-50%)',
              width: '50%', height: '100%',
              background: `radial-gradient(ellipse at 50% 0%, ${color}20 0%, transparent 72%)`,
              pointerEvents: 'none', zIndex: 0,
              transition: 'left 0.5s ease',
            }} />
          );
        })()}

        {/* Character frames */}
        {selectedChars.map((t, i) => {
          const isActive = activeSpeaker?.id === t.id;
          const layout = charLayout[i];
          if (!layout) return null;
          // Resolve avatar: active speaker shows current emotion, others stay Default
          const emotionForAvatar = isActive ? currentEmotion : 'Default';
          const src = resolveAvatar(emotionForAvatar, t);

          return (
            <div
              key={t.id}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${layout.left}%`,
                width: `${layout.width}%`,
                height: '80%',
                zIndex: isActive ? 2 : 1,
                transition: 'filter 0.45s ease, transform 0.45s ease',
                filter: !activeSpeaker || isActive
                  ? 'brightness(1)'
                  : 'brightness(0.28) grayscale(0.55)',
                transform: `scaleX(${layout.flip ? -1 : 1}) scale(${isActive ? 1.04 : 1})`,
                transformOrigin: layout.flip ? 'right bottom' : 'left bottom',
              }}
            >
              {src ? (
                <img
                  key={src}
                  src={src}
                  alt={charName(t)}
                  draggable={false}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain', objectPosition: 'bottom center',
                    display: 'block',
                    animation: 'charFadeIn 0.22s ease',
                    filter: isActive
                      ? 'drop-shadow(0 0 16px rgba(255,255,255,0.4))'
                      : 'none',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'flex-end',
                  justifyContent: layout.flip ? 'flex-end' : 'flex-start',
                  paddingBottom: '15%', paddingLeft: '10%', paddingRight: '10%',
                  fontSize: 72, lineHeight: 1,
                  filter: isActive ? `drop-shadow(0 0 20px ${charColor(t)}88)` : 'none',
                }}>
                  {EMOTION_META[emotionForAvatar].emoji}
                </div>
              )}
            </div>
          );
        })}

        {/* ── VN Dialog box ─────────────────────────────────────────────── */}
        {currentScriptLine && (
          <div
            key={currentLine}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(5,3,12,0.90)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderTop: `1px solid ${activeSpeaker ? charColor(activeSpeaker) + '40' : '#1a1228'}`,
              padding: '14px 28px 20px',
              zIndex: 10,
              animation: 'dialogFadeIn 0.18s ease',
            }}
          >
            {/* Speaker name + emotion */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            }}>
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: activeSpeaker ? charColor(activeSpeaker) : '#b8a0e0',
                textShadow: activeSpeaker ? `0 0 14px ${charColor(activeSpeaker)}55` : 'none',
                letterSpacing: 0.5,
              }}>
                {currentScriptLine.name}
              </div>
              <div style={{
                fontSize: 11, color: '#554466',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <span>{EMOTION_META[currentScriptLine.emotion].emoji}</span>
                <span>{EMOTION_META[currentScriptLine.emotion].zh}</span>
              </div>
            </div>
            {/* Dialogue text */}
            <div style={{
              fontSize: 15, color: '#ddd6ee', lineHeight: 1.9, minHeight: 52,
            }}>
              {currentScriptLine.text}
            </div>
            {/* Advance hint */}
            <div style={{
              position: 'absolute', bottom: 14, right: 24,
              fontSize: 10, color: '#2a1e3a',
            }}>
              {isAutoPlay ? '自动播放中…' : '点击下方 › 继续'}
            </div>
          </div>
        )}
      </div>

      {/* ── Control bar ───────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, padding: '8px 16px',
        background: 'rgba(4,3,10,0.97)',
        borderTop: '1px solid #0c0818',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Progress dots */}
        <div style={{
          flex: 1, display: 'flex', gap: 3, overflow: 'hidden', alignItems: 'center',
        }}>
          {script.map((_, i) => (
            <div
              key={i}
              onClick={() => { setIsAutoPlay(false); setCurrentLine(i); }}
              title={`第 ${i + 1} 条`}
              style={{
                height: 5, flexShrink: 0, borderRadius: 3, cursor: 'pointer',
                width: i === currentLine ? 18 : 5,
                background: i === currentLine
                  ? (activeSpeaker ? charColor(activeSpeaker) : '#9a70d0')
                  : i < currentLine ? '#2e1e48' : '#14101e',
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>

        {/* Prev */}
        <button
          onClick={() => { setIsAutoPlay(false); setCurrentLine((l) => Math.max(0, l - 1)); }}
          disabled={currentLine === 0}
          style={{ ...NAV_BTN, opacity: currentLine === 0 ? 0.35 : 1 }}
        >
          ‹ 上一条
        </button>

        {/* Auto-play */}
        <button
          onClick={() => setIsAutoPlay((v) => !v)}
          style={{
            ...NAV_BTN,
            color: isAutoPlay ? '#c8a0f0' : '#776688',
            borderColor: isAutoPlay ? '#6a40a0' : '#221a32',
            minWidth: 64,
          }}
        >
          {isAutoPlay ? '⏸ 暂停' : '▶ 自动'}
        </button>

        {/* Next */}
        <button
          onClick={() => { setIsAutoPlay(false); setCurrentLine((l) => Math.min(script.length - 1, l + 1)); }}
          disabled={currentLine >= script.length - 1}
          style={{ ...NAV_BTN, opacity: currentLine >= script.length - 1 ? 0.35 : 1 }}
        >
          下一条 ›
        </button>

        <div style={{ width: 1, height: 18, background: '#1a1228', flexShrink: 0 }} />

        {/* Export */}
        <button
          onClick={exportScript}
          style={{
            ...NAV_BTN,
            color: copyFeedback ? '#70c878' : '#887799',
            borderColor: copyFeedback ? '#2e5e32' : '#221a32',
            minWidth: 70,
          }}
        >
          {copyFeedback ? '✓ 已复制' : '导出剧本'}
        </button>

        {/* Re-generate */}
        <button
          onClick={() => { setPhase('select'); setIsAutoPlay(false); }}
          style={{ ...NAV_BTN }}
        >
          重写
        </button>
      </div>

      <style>{`
        @keyframes charFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dialogFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>,
    document.body
  );
}
