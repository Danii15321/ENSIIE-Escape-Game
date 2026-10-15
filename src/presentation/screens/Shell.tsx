import { useEffect, useRef, type ReactNode } from 'react';
import { BookOpen, Map, Package, Pause, Play, Settings } from 'lucide-react';
import { Backdrop, type Scene } from '../components/Backdrop';
import { BrandLockup } from '../components/Brand';

export type Tab = 'journey' | 'memory' | 'ending' | 'settings';

export function Shell({
  scene,
  vivid,
  integrity,
  topbar,
  tabs,
  current,
  onTab,
  onPause,
  notice,
  children,
}: {
  scene: Scene;
  vivid: boolean;
  integrity: number;
  topbar: boolean;
  tabs: Tab[];
  current?: Tab;
  onTab: (tab: Tab) => void;
  onPause: () => void;
  notice?: ReactNode;
  children: ReactNode;
}) {
  const labels: Record<Tab, [string, typeof Map]> = {
    journey: ['Parcours', Map],
    memory: ['Carnet', BookOpen],
    ending: ['La capsule', Package],
    settings: ['Réglages', Settings],
  };
  return (
    <div className={`app scene-${scene}${tabs.length ? ' has-tabs' : ''}`}>
      <Backdrop scene={scene} intensity={vivid ? 'vivid' : 'calm'} />
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      {topbar ? (
        <header className="topbar">
          <BrandLockup integrity={integrity} />
          <button
            type="button"
            className="icon-button"
            aria-label="Mettre en pause"
            onClick={onPause}
          >
            <Pause aria-hidden="true" size={20} />
          </button>
        </header>
      ) : null}
      {notice}
      <main id="main" className="screen">
        {children}
      </main>
      {tabs.length ? (
        <nav className="bottom-nav" aria-label="Navigation principale">
          {tabs.map((tab) => {
            const [label, Icon] = labels[tab];
            return (
              <button
                key={tab}
                type="button"
                aria-current={current === tab ? 'page' : undefined}
                onClick={() => onTab(tab)}
              >
                <Icon aria-hidden="true" size={22} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}

export function PauseOverlay({ onResume }: { onResume: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => button.current?.focus(), []);
  return (
    <div className="pause-layer" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="pause-card">
        <h2 id="pause-title">Partie en pause</h2>
        <p>Votre carnet reste enregistré.</p>
        <button ref={button} className="primary is-large" onClick={onResume}>
          <Play aria-hidden="true" size={20} /> Reprendre
        </button>
      </div>
    </div>
  );
}
