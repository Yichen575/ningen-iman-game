import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  visible: boolean;
  chapterName?: string;
  onComplete: () => void;
}

export default function ChapterTransition({ visible, chapterName, onComplete }: Props) {
  // After the fade-in completes (0.6s), fire onComplete so App can switch state.
  // The overlay then fades out.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onComplete, 620);
    return () => clearTimeout(t);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chapter-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {chapterName && (
            <motion.div
              initial={{ opacity: 0, y: 12, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.15em' }}
              transition={{ delay: 0.18, duration: 0.5, ease: 'easeOut' }}
              style={{
                fontSize: 22, fontWeight: 800, color: '#d4a030',
                letterSpacing: '0.15em',
                textShadow: '0 0 30px rgba(212,160,48,0.5)',
              }}
            >
              {chapterName}
            </motion.div>
          )}
          {!chapterName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{ fontSize: 14, color: '#5a4028', letterSpacing: '0.25em' }}
            >
              ···
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
