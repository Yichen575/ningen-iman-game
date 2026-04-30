import { useState } from 'react';
import LandingNav from './LandingNav';
import LandingHeroA from './LandingHeroA';
import LandingHeroB from './LandingHeroB';
import LandingHeroC from './LandingHeroC';
import LandingLore from './LandingLore';
import LandingWorldMap from './LandingWorldMap';
import LandingFooter from './LandingFooter';
import StoryReader from './StoryReader';

type HeroLayout = 'A' | 'B' | 'C';

interface Props { onPlay: () => void; }

export default function LandingPage({ onPlay }: Props) {
  const [heroLayout] = useState<HeroLayout>('A');
  const [showStory, setShowStory] = useState(false);

  const Hero = heroLayout === 'B' ? LandingHeroB : heroLayout === 'C' ? LandingHeroC : LandingHeroA;

  return (
    <div
      id="landing-scroll"
      style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--ink)',
        color: 'var(--paper)',
      }}
    >
      <LandingNav onPlay={onPlay} onOpenStory={() => setShowStory(true)} />
      <Hero onPlay={onPlay} />
      <LandingLore />
      <LandingWorldMap />
      <LandingFooter onPlay={onPlay} />
      <StoryReader open={showStory} onClose={() => setShowStory(false)} />
    </div>
  );
}
