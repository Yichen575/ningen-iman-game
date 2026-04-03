import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { GameItem } from '../types';
import { getStyleLabel } from '../utils/anbuGenerator';

interface Props {
  item: GameItem;
  aiSystemPrompt: string;
  apiKey: string;
  isLightOn: boolean;
  onSave: (description: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditDescModal({ item, aiSystemPrompt, apiKey, isLightOn, onSave, onDelete, onClose }: Props) {
  const [desc, setDesc] = useState(item.description);
  const [hint, setHint] = useState('');
  const [showAiSection, setShowAiSection] = useState(false);
  const [styleWeight, setStyleWeight] = useState(0.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  function handleSave() { onSave(desc); onClose(); }
  function handleDelete() { onDelete(); onClose(); }

  async function handleAIGenerate() {
    if (isGenerating) return;
    setErrorMsg('');

    if (!apiKey) {
      setErrorMsg('请先在 ⚙ 设置 中填写 DeepSeek API Key');
      return;
    }

    const v = styleWeight;
    const toneInstruction =
      v < 0.33
        ? '文风偏向内敛压抑，用留白和意象传递情绪，避免直白抒情，不堆砌形容词。'
        : v <= 0.66
        ? '文风平实干练，像档案记录员写下的一条备注，不加修饰，但细节要落地。'
        : '文风带有角色性格驱动的冷幽默，幽默感必须来自人物本身的行为逻辑，不强行制造荒诞。';

    const darkModeNote = isLightOn
      ? ''
      : '\n\n当前场景：深夜，更衣室没有开灯，四周漆黑，气氛压抑诡异。请让生成内容也体现出这种黑暗中的氛围。';

    const systemContent =
      (aiSystemPrompt || '你是《人间未满》同人小说的叙事者。') +
      darkModeNote +
      '\n\n创作原则：' +
      '\n- 故事必须符合常理，逻辑自洽，不为制造效果而扭转叙事' +
      '\n- 语言克制，不堆砌形容词，不刻意渲染情绪' +
      '\n- 内容落地，围绕这个物品在故事里实际可能发生的事情' +
      '\n- 字数控制在30字以内，只输出故事文本，不加任何说明或前缀';

    const userContent =
      `为物品「${item.label}」写一段背景故事。` +
      (hint ? `\n创作提示：${hint}` : '') +
      `\n${toneInstruction}`;

    // Clear existing content immediately before generating
    setDesc('');
    setIsGenerating(true);

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
          max_tokens: 500,
          temperature: 0.8,
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: userContent },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API 错误 ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const generated: string = data.choices?.[0]?.message?.content ?? '';

      // Typewriter effect from empty
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setDesc(generated.slice(0, i));
        if (i >= generated.length) {
          clearInterval(timer);
          setIsGenerating(false);
        }
      }, 30);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setErrorMsg(err instanceof Error ? err.message : '生成失败，请重试');
      setIsGenerating(false);
    }
  }

  const sliderLabel = getStyleLabel(styleWeight);
  const sliderPct = styleWeight * 100;

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
          borderRadius: 8, padding: 24, width: 440, maxWidth: '90vw',
          boxShadow: '0 0 30px rgba(255,216,74,0.25)',
        }}
      >
        {/* Title */}
        <div style={{ fontSize: 15, fontWeight: 600, color: '#ffd84a', marginBottom: 16 }}>
          {item.label}
        </div>

        {/* Description textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={desc}
            onChange={(e) => { if (!isGenerating) setDesc(e.target.value); }}
            placeholder="在这里写下这个物品的背景故事..."
            rows={4}
            readOnly={isGenerating}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: isGenerating ? '#0a0e14' : '#0e1218',
              color: isGenerating ? '#b8d890' : '#e8e0c0',
              border: `1px solid ${isGenerating ? '#4a6a2a' : '#444'}`,
              borderRadius: 4, padding: '10px 12px', fontSize: 13,
              lineHeight: 1.7, resize: 'vertical', outline: 'none',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          />
          {isGenerating && (
            <span style={{
              position: 'absolute', bottom: 10, right: 10,
              fontSize: 13, color: '#88cc44',
              animation: 'blink 0.7s step-end infinite',
            }}>▌</span>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{ fontSize: 11, color: '#ff6060', marginTop: 6 }}>
            {errorMsg}
          </div>
        )}

        {/* AI Section toggle */}
        <button
          onClick={() => setShowAiSection((v) => !v)}
          style={{
            marginTop: 10, background: 'none', border: '1px solid #333',
            color: '#888', cursor: 'pointer', fontSize: 12,
            padding: '5px 10px', borderRadius: 4,
          }}
        >
          {showAiSection ? '▲' : '▼'} AI 续写
        </button>

        {showAiSection && (
          <div style={{ marginTop: 12 }}>

            {/* ── Style Slider ── */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 6,
              }}>
                <span style={{ fontSize: 11, color: '#6680aa' }}>正经 · 忧郁</span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: styleWeight < 0.4 ? '#7aabdd'
                       : styleWeight > 0.6 ? '#ffd84a'
                       : '#aabbcc',
                  transition: 'color 0.3s',
                }}>
                  {sliderLabel}
                </span>
                <span style={{ fontSize: 11, color: '#aa8830' }}>怪诞 · 吐槽</span>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="range"
                  min={0} max={100} step={1}
                  value={Math.round(styleWeight * 100)}
                  onChange={(e) => setStyleWeight(Number(e.target.value) / 100)}
                  style={{
                    width: '100%', height: 6,
                    appearance: 'none', outline: 'none',
                    background: `linear-gradient(to right,
                      #4a6e9a 0%,
                      #6688bb ${sliderPct}%,
                      #2a2a3a ${sliderPct}%,
                      #2a2a3a 100%)`,
                    borderRadius: 3, cursor: 'pointer',
                  }}
                />
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 4, fontSize: 10, color: '#334',
              }}>
                <span>压抑</span>
                <span>留白</span>
                <span>冷幽默</span>
                <span>荒诞</span>
                <span>卡卡西很困扰</span>
              </div>
            </div>

            {/* Hint input (ephemeral, not saved) */}
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
              生成提示（仅本次生成使用，不保存）：
            </div>
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="输入关于这个物品的提示，例如：止水第一次任务时带着它，后来送给了阿伦"
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#0a0e16', color: '#c8c0a0',
                border: '1px solid #333', borderRadius: 4,
                padding: '8px 10px', fontSize: 12,
                lineHeight: 1.7, resize: 'vertical', outline: 'none',
              }}
            />

            {/* Generate button */}
            <div style={{ marginTop: 10 }}>
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                style={{
                  background: isGenerating ? '#1e2a10' : '#2a3a14',
                  border: `1px solid ${isGenerating ? '#4a6a20' : '#7aaa28'}`,
                  color: isGenerating ? '#88aa44' : '#ccee66',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontSize: 12, padding: '7px 16px', borderRadius: 4,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                {isGenerating ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span>
                    正在感应物品记忆...
                  </>
                ) : '✦ AI 续写背景故事'}
              </button>
              {!isGenerating && (
                <div style={{ fontSize: 10, color: '#334', marginTop: 5 }}>
                  可重复点击，每次随机
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <button
            onClick={handleDelete}
            style={{
              background: '#3a1010', border: '1px solid #cc2222',
              color: '#ff6060', cursor: 'pointer', fontSize: 12,
              padding: '7px 14px', borderRadius: 4,
            }}
          >
            删除物品
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid #444',
                color: '#888', cursor: 'pointer', fontSize: 12,
                padding: '7px 14px', borderRadius: 4,
              }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isGenerating}
              style={{
                background: isGenerating ? '#1e2810' : '#2a3a10',
                border: '1px solid #88aa22',
                color: isGenerating ? '#666' : '#ccee44',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontSize: 12, padding: '7px 14px', borderRadius: 4,
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
