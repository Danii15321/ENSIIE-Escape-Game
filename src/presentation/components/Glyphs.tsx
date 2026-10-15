import {
  BookOpen,
  Building2,
  Cpu,
  Eye,
  FolderOpen,
  History,
  KeyRound,
  LayoutGrid,
  ListOrdered,
  MapPin,
  Network,
  RadioTower,
  Route,
  Scale,
  ShieldCheck,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react';

export const chapterIcons: Record<string, LucideIcon> = {
  signal: RadioTower,
  folder: FolderOpen,
  network: Network,
  seed: Sprout,
};

const missionIcons: Record<string, LucideIcon> = {
  'pro-00': RadioTower,
  'pas-01': ListOrdered,
  'pas-02': KeyRound,
  'pas-03': Scale,
  'syn-01': History,
  'pre-01': Cpu,
  'pre-02': Eye,
  'syn-02': LayoutGrid,
  'fut-01': Building2,
  'fut-02': Route,
  'fut-c': Users,
  'syn-03': ShieldCheck,
  'ext-est': MapPin,
};

export function MissionGlyph({ levelId, size = 22 }: { levelId: string; size?: number }) {
  const Icon = missionIcons[levelId] ?? BookOpen;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />;
}

export function ChapterGlyph({ icon, size = 22 }: { icon: string; size?: number }) {
  const Icon = chapterIcons[icon] ?? BookOpen;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />;
}
