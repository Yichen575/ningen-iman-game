import express from 'express';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORY_FILE = join(__dirname, '../src/components/landing/storyData.ts');
const STORIES_DIR = join(__dirname, '../stories');

const app = express();
app.use(express.json({ limit: '10mb' }));

const META_TEMPLATE = (data) => `export interface Chapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  date: string;
  pullQuote?: string;
}

export interface Volume {
  id: string;
  indexCh: string;
  indexJp: string;
  indexNum: string;
  title: string;
  titleEn: string;
  subtitle: string;
  blurb: string;
  accent: string;
  chapters: Chapter[];
}

const STORY_DATA: Volume[] = ${JSON.stringify(data, null, 2)};

export default STORY_DATA;
`;

// GET chapter body from markdown file
app.get('/api/story/:volId/:chapId', (req, res) => {
  const { volId, chapId } = req.params;
  const filePath = join(STORIES_DIR, volId, `${chapId}.md`);
  try {
    const text = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
    res.json({ ok: true, text });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// POST (save) chapter body to markdown file
app.post('/api/story/:volId/:chapId', (req, res) => {
  const { volId, chapId } = req.params;
  const { text } = req.body;
  if (typeof text !== 'string') return res.status(400).json({ ok: false, error: 'text must be a string' });
  try {
    const dir = join(STORIES_DIR, volId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${chapId}.md`), text, 'utf-8');
    console.log(`[story] wrote ${volId}/${chapId}.md`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// POST metadata only to storyData.ts (body field stripped by client before sending)
app.post('/api/save-story', (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ ok: false, error: 'body must be an array' });
    }
    writeFileSync(STORY_FILE, META_TEMPLATE(data), 'utf-8');
    console.log(`[save-story] wrote ${data.length} volumes to storyData.ts`);
    res.json({ ok: true });
  } catch (err) {
    console.error('[save-story] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(3001, () => {
  console.log('[api] ready → http://localhost:3001');
});
