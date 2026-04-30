import express from 'express';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORY_FILE = join(__dirname, '../src/components/landing/storyData.ts');

const app = express();
app.use(express.json({ limit: '10mb' }));

const FILE_TEMPLATE = (data) => `export interface Chapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  date: string;
  body: string[];
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

app.post('/api/save-story', (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ ok: false, error: 'body must be an array' });
    }
    writeFileSync(STORY_FILE, FILE_TEMPLATE(data), 'utf-8');
    console.log(`[save-story] wrote ${data.length} volumes to storyData.ts`);
    res.json({ ok: true });
  } catch (err) {
    console.error('[save-story] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(3001, () => {
  console.log('[save-story] API ready → http://localhost:3001');
});
