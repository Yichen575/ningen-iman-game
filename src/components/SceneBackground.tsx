import { BACKGROUND_STYLES } from '../constants/scenes';
import type { Scene } from '../types';

interface Props {
  scene: Scene;
}

export default function SceneBackground({ scene }: Props) {
  let style: React.CSSProperties = { width: '100%', height: '100%', position: 'absolute', inset: 0 };

  if (scene.backgroundType === 'image' && scene.backgroundImageUrl) {
    style = {
      ...style,
      backgroundImage: `url(${scene.backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (scene.backgroundKey && BACKGROUND_STYLES[scene.backgroundKey]) {
    style = { ...style, ...BACKGROUND_STYLES[scene.backgroundKey] };
  } else {
    style = { ...style, backgroundColor: '#1a1e24' };
  }

  return <div style={style} />;
}
