import type { Scene } from '../types';

export const BACKGROUND_STYLES: Record<string, React.CSSProperties> = {
  'anbu-locker': {
    backgroundColor: '#1a1e24',
    backgroundImage: [
      // vertical locker lines
      'repeating-linear-gradient(90deg, transparent 0px, transparent 68px, #0d1117 68px, #0d1117 72px, #2a3040 72px, #2a3040 74px, transparent 74px)',
      // horizontal shelf lines
      'repeating-linear-gradient(180deg, transparent 0px, transparent 118px, #0d1117 118px, #0d1117 120px)',
      // cold blue fluorescent light from upper-right
      'radial-gradient(ellipse 600px 300px at 80% 8%, rgba(80,120,180,0.22) 0%, transparent 70%)',
      // subtle second light source left
      'radial-gradient(ellipse 300px 200px at 15% 12%, rgba(60,90,140,0.12) 0%, transparent 60%)',
      // dark floor gradient
      'linear-gradient(180deg, #1a1e24 0%, #141820 60%, #0e1016 100%)',
    ].join(', '),
  },
  'death-forest': {
    backgroundColor: '#040d06',
    backgroundImage: [
      // fog layers
      'radial-gradient(ellipse 500px 220px at 20% 72%, rgba(30,55,30,0.45) 0%, transparent 70%)',
      'radial-gradient(ellipse 600px 260px at 72% 65%, rgba(20,45,22,0.38) 0%, transparent 70%)',
      'radial-gradient(ellipse 350px 160px at 48% 82%, rgba(38,60,35,0.32) 0%, transparent 62%)',
      'radial-gradient(ellipse 280px 120px at 88% 78%, rgba(25,50,28,0.28) 0%, transparent 55%)',
      // tree trunk columns
      'repeating-linear-gradient(90deg, transparent 0px, transparent 52px, rgba(4,10,4,0.85) 52px, rgba(4,10,4,0.85) 66px, transparent 66px)',
      // canopy darkness at top
      'linear-gradient(180deg, #020804 0%, #061209 20%, #081a0b 45%, #061008 70%, #040a06 100%)',
    ].join(', '),
  },
  'naha-river': {
    backgroundColor: '#0a0e18',
    backgroundImage: [
      // water ripple lines
      'repeating-linear-gradient(180deg, transparent 0px, transparent 8px, rgba(40,60,100,0.13) 8px, rgba(40,60,100,0.13) 10px)',
      // muddy bank bottom
      'linear-gradient(180deg, transparent 60%, rgba(55,38,18,0.55) 72%, rgba(48,30,14,0.78) 83%, rgba(40,25,12,0.95) 100%)',
      // water body
      'linear-gradient(180deg, transparent 28%, rgba(14,28,62,0.65) 48%, rgba(9,18,48,0.9) 63%)',
      // pale moon glow
      'radial-gradient(ellipse 220px 170px at 50% 14%, rgba(80,105,155,0.28) 0%, transparent 70%)',
      // dusk sky
      'linear-gradient(180deg, #0a0e18 0%, #0d1428 18%, #0a1020 34%, #060c18 50%)',
    ].join(', '),
  },
};

export const BUILTIN_SCENES: Scene[] = [
  {
    id: 'scene-anbu',
    name: '暗部更衣室',
    builtin: true,
    backgroundType: 'builtin',
    backgroundKey: 'anbu-locker',
  },
  {
    id: 'scene-forest',
    name: '死亡森林',
    builtin: true,
    backgroundType: 'builtin',
    backgroundKey: 'death-forest',
  },
  {
    id: 'scene-river',
    name: '南贺川',
    builtin: true,
    backgroundType: 'builtin',
    backgroundKey: 'naha-river',
  },
];
