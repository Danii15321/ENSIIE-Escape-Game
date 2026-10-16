import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import rawJourney from '../../game/campaigns/chrono-iie/journey.json';
import { catalog, sourceRegistry } from './catalog';
import { useGame } from './useGame';
import { endingModel } from './endings';
import { EndingPanel } from './EndingPanel';
import { OfflinePanel } from './OfflinePanel';
import { systemReducedMotion, usePreferences } from './preferences';
import { playCue } from './sound';
import { useActiveTime } from './activeTime';
import { withTransition } from './transition';
import {
  choicesFrozen,
  initialProgress,
  integrity,
  inventory,
  isComplete,
  outcome,
  resolveInputs,
} from '../core/session/engine';
import {
  closesChapter,
  nextStop,
  parseJourney,
  stopState,
  type Chapter,
} from '../core/session/journey';
import type { Level } from '../core/contracts';
import { downloadSave, downloadText } from '../adapters/storage/local';
import { LevelView } from '../presentation/components/LevelView';
import { Preview } from '../authoring/preview/Preview';
import {
  EditorialProvider,
  parsePresentationCatalog,
} from '../presentation/components/EditorialCopy';
import { AmbienceProvider, type Cue } from '../presentation/components/Ambience';
import type { Scene } from '../presentation/components/Backdrop';
import { PauseOverlay, Shell, type Tab } from '../presentation/screens/Shell';
import { TitleScreen } from '../presentation/screens/TitleScreen';
import { JourneyScreen } from '../presentation/screens/JourneyScreen';
import { ChapterIntro } from '../presentation/screens/ChapterIntro';
import { RewardScreen } from '../presentation/screens/RewardScreen';
import { MemoryScreen } from '../presentation/screens/MemoryScreen';
import { SettingsScreen } from '../presentation/screens/SettingsScreen';
import type {
  BonusView,
  ChapterView,
  MemoryChapter,
  NextView,
  SiteOption,
  StopView,
} from '../presentation/screens/types';
import { media } from '../presentation/theme/media';
import { SitePhotosProvider } from '../presentation/components/SitePhotos';

const editorial = parsePresentationCatalog(
  import.meta.glob('../../game/levels/*/presentation.json', { eager: true, import: 'default' }),
);
export const journey = parseJourney(rawJourney, catalog);
const siteAssets = import.meta.glob('../../game/sites/*/assets/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const sitePhoto = (siteId: string, file: string) =>
  siteAssets[`../../game/sites/${siteId}/assets/${file}`];

type Screen =
  | 'title'
  | 'journey'
  | 'chapter'
  | 'mission'
  | 'reward'
  | 'memory'
  | 'settings'
  | 'ending'
  | 'author';
type Reward = { levelId: string; before: number; after: number };

const sceneOf = (era: Level['era'] | Chapter['era']): Scene => (era === 'extension' ? 'past' : era);
const sites: SiteOption[] = Object.values(catalog.sites)
  .filter((site) => site.verified)
  .map((site) => ({ id: site.id, title: site.title, mode: site.mode }));
const defaultSiteId = sites.some((site) => site.id === 'evry-2026') ? 'evry-2026' : sites[0]!.id;

export function App() {
  const params = useMemo(() => new URLSearchParams(location.search), []);
  const authorRequested = params.has('level') || params.has('atelier');
  const game = useGame(catalog);
  const { prefs, update, reducedMotion } = usePreferences();
  const [screen, setScreen] = useState<Screen>(authorRequested ? 'author' : 'title');
  const [levelId, setLevelId] = useState<string>();
  const [chapterId, setChapterId] = useState<string>('prologue');
  const [reward, setReward] = useState<Reward>();
  const [paused, setPaused] = useState(false);
  const [fileError, setFileError] = useState('');
  const returnFocus = useRef<string | undefined>(undefined);
  const previous = useRef(game.session);
  const session = game.session;
  const seconds = useActiveTime(
    session.id,
    !paused && screen !== 'title' && screen !== 'author' && screen !== 'ending',
  );
  const score = integrity(session, catalog);
  const capsule = endingModel(session, catalog, seconds);
  const finished = capsule !== null;
  const next = nextStop(journey, session, catalog);
  const site = catalog.sites[session.siteId]!;
  const team = session.team;
  const cue = useCallback(
    (name: Cue) => {
      if (prefs.sound) playCue(name);
    },
    [prefs.sound],
  );
  const ambience = useMemo(
    () => ({ reducedMotion, instantText: prefs.instantText, integrity: score, cue }),
    [reducedMotion, prefs.instantText, score, cue],
  );
  const go = (target: Screen, apply?: () => void) =>
    withTransition(() => {
      apply?.();
      setScreen(target);
    }, reducedMotion);

  const openMission = (id: string) => {
    returnFocus.current = id;
    game.send({ type: 'open', levelId: id });
    go('mission', () => setLevelId(id));
  };
  const advance = () => {
    const target = nextStop(journey, game.session, catalog);
    if (!target) {
      if (finished) {
        cue('capsule');
        go('ending');
      } else go('journey');
      return;
    }
    if (target.index === 0 && !game.session.progress[target.levelId])
      go('chapter', () => setChapterId(target.chapter.id));
    else openMission(target.levelId);
  };
  const startGame = (name: string, siteId: string) => {
    game.reset(siteId, name);
    go('chapter', () => setChapterId('prologue'));
  };

  useEffect(() => {
    const before = previous.current;
    previous.current = session;
    if (screen !== 'mission' || !levelId || before.id !== session.id) return;
    if (!isComplete(before.progress[levelId]) && isComplete(session.progress[levelId])) {
      cue(closesChapter(journey, catalog, levelId) ? 'acte' : 'fragment');
      setReward({
        levelId,
        before: integrity(before, catalog),
        after: integrity(session, catalog),
      });
      go('reward');
    }
  });
  useEffect(() => {
    if (screen !== 'journey' || !returnFocus.current) return;
    document.getElementById(`open-${returnFocus.current}`)?.focus();
    returnFocus.current = undefined;
  }, [screen]);

  const stopView = (id: string, number: number): StopView => {
    const level = catalog.levels[id]!;
    const required = catalog.campaign.levels.find((entry) => entry.id === id)?.requires[0];
    return {
      levelId: id,
      title: level.title,
      teaser: journey.teasers[id]!,
      minutes: level.minutes,
      state: stopState(journey, session, catalog, id),
      optional: Boolean(level.narrative),
      number,
      assisted: session.progress[id]?.status === 'assisted',
      after: required ? catalog.levels[required]?.title : undefined,
    };
  };
  const chapters: ChapterView[] = journey.chapters.map((chapter) => {
    let number = 0;
    const items = chapter.levels.map((id) =>
      stopView(id, catalog.levels[id]?.narrative ? 0 : ++number),
    );
    const required = items.filter((item) => !item.optional);
    return {
      id: chapter.id,
      label: chapter.label,
      title: chapter.title,
      era: chapter.era,
      years: chapter.years,
      icon: chapter.icon,
      done: required.filter((item) => item.state === 'done').length,
      total: required.length,
      stops: items,
    };
  });
  const bonus: BonusView[] = journey.bonus.map((entry) => ({
    ...stopView(entry.level, 0),
    label: entry.label,
    image: entry.image ? media[entry.image] : undefined,
    afterLevelId: entry.after,
  }));
  const nextView: NextView | null = next
    ? {
        ...stopView(next.levelId, next.index + 1),
        chapterLabel: `${next.chapter.label} · ${next.chapter.title}`,
        era: next.chapter.era,
        started: Boolean(session.progress[next.levelId]),
      }
    : null;
  const fragments = inventory(session, catalog);
  const memory: MemoryChapter[] = journey.chapters.map((chapter) => ({
    id: chapter.id,
    label: chapter.label,
    title: chapter.title,
    era: chapter.era,
    entries: [
      ...chapter.levels,
      ...journey.bonus
        .filter((entry) => chapter.levels.includes(entry.after))
        .map((entry) => entry.level),
    ]
      .filter((id) => !catalog.levels[id]?.narrative)
      .map((id) => {
        const progress = session.progress[id];
        return {
          levelId: id,
          title: catalog.levels[id]!.title,
          state: !isComplete(progress)
            ? ('missing' as const)
            : progress!.status === 'assisted'
              ? ('assisted' as const)
              : ('restored' as const),
          fragments: fragments.filter((item) => item.provenance === id).map((item) => item.summary),
          capsule: catalog.levels[id]!.capsule,
          note: progress?.fallbackObservations.length
            ? `Secours textuel ${progress.fallbackObservations.join(', ')} consulté`
            : progress?.status === 'assisted'
              ? 'Restauré avec aide'
              : undefined,
        };
      }),
  }));
  const councils = Object.values(catalog.levels).filter(
    (level) => level.narrative && level.status !== 'draft',
  );
  const commitments = outcome(
    councils,
    Object.fromEntries(
      councils.map((level) => [level.id, session.progress[level.id]?.choices ?? {}]),
    ),
  ).commitments;

  const level = levelId ? catalog.levels[levelId] : undefined;
  const mission = journey.chapters.find((chapter) => chapter.levels.includes(levelId ?? ''));
  const missionPosition = (() => {
    if (!level || !mission) return undefined;
    const required = mission.levels.filter((id) => !catalog.levels[id]?.narrative);
    return {
      label: `${mission.label} · ${mission.title}`,
      position: level.narrative
        ? `${mission.label}`
        : `${mission.label} · Mission ${required.indexOf(level.id) + 1} sur ${required.length}`,
    };
  })();
  const chapter = journey.chapters.find((item) => item.id === chapterId) ?? journey.chapters[0]!;
  const rewardLevel = reward ? catalog.levels[reward.levelId] : undefined;
  const rewardChapter = reward
    ? journey.chapters.find((c) => c.levels.includes(reward.levelId))
    : undefined;

  const scene: Scene =
    screen === 'mission' && level
      ? sceneOf(level.era)
      : screen === 'reward' && rewardLevel
        ? sceneOf(rewardLevel.era)
        : screen === 'chapter'
          ? sceneOf(chapter.era)
          : screen === 'journey'
            ? next
              ? sceneOf(next.chapter.era)
              : 'final'
            : screen === 'ending'
              ? 'final'
              : 'neutral';
  const tabs: Tab[] = ['journey', 'memory', ...(finished ? (['ending'] as Tab[]) : []), 'settings'];
  const withTabs = ['journey', 'memory', 'settings', 'ending'].includes(screen);
  const notice = game.notice ? (
    <section className="notice-banner" role="alert">
      <p>{game.notice}</p>
      {game.raw ? (
        <button onClick={() => downloadText(game.raw!, 'chrono-iie-original.json')}>
          Exporter la sauvegarde originale
        </button>
      ) : null}
    </section>
  ) : null;

  let content;
  if (screen === 'author')
    content = (
      <section className="author" aria-label="Atelier des niveaux">
        <div className="author-head">
          <p className="eyebrow">Outil de conception</p>
          <button className="ghost-button" onClick={() => go('title')}>
            Quitter l’atelier
          </button>
        </div>
        <Preview catalog={catalog} sources={sourceRegistry} />
      </section>
    );
  else if (screen === 'title')
    content = (
      <TitleScreen
        integrity={score}
        resume={
          Object.keys(session.progress).length
            ? finished
              ? 'Capsule ouverte'
              : next
                ? `${next.chapter.label} · ${catalog.levels[next.levelId]!.title}`
                : 'Parcours en cours'
            : null
        }
        finished={finished}
        team={team}
        sites={sites}
        defaultSiteId={defaultSiteId}
        onResume={() => (finished ? go('ending') : go('journey'))}
        onStart={startGame}
        onExport={() => downloadSave(session)}
        onSettings={() => go('settings')}
      />
    );
  else if (screen === 'chapter')
    content = (
      <ChapterIntro
        key={chapter.id}
        chapter={chapter}
        images={chapter.images.flatMap((id) => (media[id] ? [media[id]] : []))}
        missions={chapter.levels.map((id) => ({
          title: catalog.levels[id]!.title,
          optional: Boolean(catalog.levels[id]!.narrative),
        }))}
        onBegin={() => {
          const target = nextStop(journey, game.session, catalog);
          openMission(
            target && target.chapter.id === chapter.id ? target.levelId : chapter.levels[0]!,
          );
        }}
      />
    );
  else if (screen === 'mission' && level)
    content = (
      <fieldset className="play-area" disabled={game.blocked}>
        <legend>Dossier ouvert</legend>
        <LevelView
          key={`${session.id}:${level.id}`}
          level={level}
          progress={session.progress[level.id] ?? initialProgress(level)}
          context={{ site, inputs: resolveInputs(session, catalog, level.id) }}
          onCommand={game.send}
          onExit={level.narrative ? advance : () => go('journey')}
          exitLabel={level.narrative ? 'Continuer' : 'Retour à l’acte'}
          evaluation={game.evaluation}
          message={game.message}
          sources={sourceRegistry}
          frozen={choicesFrozen(session, catalog)}
          chapter={missionPosition}
          onBack={() => go('journey')}
          helpNudges={prefs.helpNudges}
        />
      </fieldset>
    );
  else if (screen === 'reward' && reward && rewardLevel)
    content = (
      <RewardScreen
        key={reward.levelId}
        title={rewardLevel.title}
        assisted={session.progress[reward.levelId]?.status === 'assisted'}
        successText={rewardLevel.dialogue.success.replaceAll('{equipe}', team)}
        capsule={rewardLevel.capsule}
        fragments={fragments
          .filter((item) => item.provenance === reward.levelId)
          .map((item) => item.summary)}
        before={reward.before}
        after={reward.after}
        chapterClosed={
          rewardChapter && closesChapter(journey, catalog, reward.levelId)
            ? { label: rewardChapter.label, title: rewardChapter.title }
            : undefined
        }
        finished={finished}
        onContinue={advance}
        onReview={() => go('mission')}
        onMemory={() => go('memory')}
      />
    );
  else if (screen === 'memory')
    content = <MemoryScreen chapters={memory} commitments={commitments} />;
  else if (screen === 'settings')
    content = (
      <SettingsScreen
        prefs={{
          reduceMotion: prefs.reduceMotion ?? systemReducedMotion(),
          instantText: prefs.instantText,
          sound: prefs.sound,
          largeText: prefs.largeText,
          helpNudges: prefs.helpNudges,
        }}
        onPrefs={update}
        team={team}
        siteTitle={site.title}
        sites={sites}
        defaultSiteId={session.siteId}
        fileError={fileError}
        offline={<OfflinePanel />}
        photos={Object.values(media)}
        shareUrl={`${location.origin}${location.pathname}`}
        onPause={() => setPaused(true)}
        onExport={() => downloadSave(session)}
        onImport={async (file) => {
          setFileError('');
          try {
            game.importSave(await file.text());
          } catch {
            setFileError(
              'Ce fichier ne peut pas être lu. Réessayez ou sélectionnez un autre export.',
            );
          }
        }}
        onNewGame={startGame}
        onAtelier={import.meta.env.DEV || authorRequested ? () => go('author') : undefined}
      />
    );
  else if (screen === 'ending' && capsule)
    content = (
      <AmbienceProvider value={{ ...ambience, instantText: true }}>
        <EndingPanel
          key={session.id}
          sessionId={session.id}
          model={capsule}
          onMemory={() => go('memory')}
          onHome={() => go('journey')}
        />
      </AmbienceProvider>
    );
  else
    content = (
      <JourneyScreen
        team={team}
        siteLabel={site.mode === 'real' ? 'Parcours dans l’école' : 'Démonstration'}
        integrity={score}
        chapters={chapters}
        bonus={bonus}
        next={nextView}
        finished={finished}
        blocked={game.blocked}
        onContinue={advance}
        onOpen={openMission}
        onEnding={() => {
          cue('capsule');
          go('ending');
        }}
      />
    );

  return (
    <EditorialProvider copies={editorial} team={team}>
      <SitePhotosProvider resolve={sitePhoto}>
        <AmbienceProvider value={ambience}>
          <Shell
            scene={scene}
            vivid={
              screen === 'title' ||
              screen === 'chapter' ||
              screen === 'reward' ||
              screen === 'ending'
            }
            integrity={score}
            topbar={screen === 'journey' || screen === 'memory' || screen === 'settings'}
            tabs={withTabs ? tabs : []}
            current={withTabs ? (screen as Tab) : undefined}
            onTab={(tab) => {
              if (tab === 'ending') cue('capsule');
              go(tab);
            }}
            onPause={() => setPaused(true)}
            notice={notice}
          >
            {content}
          </Shell>
          {paused ? <PauseOverlay onResume={() => setPaused(false)} /> : null}
        </AmbienceProvider>
      </SitePhotosProvider>
    </EditorialProvider>
  );
}
