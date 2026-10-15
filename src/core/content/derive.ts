import { fragmentSchema, type Fragment, type Output, type Site } from '../contracts';

export function materialize(output: Output, site: Site): Fragment {
  const { derive, ...fragment } = output;
  if (!derive) return fragmentSchema.parse(fragment);
  const observed = site.observations[derive.observation];
  const even = observed % 2 === 0;
  return fragmentSchema.parse({
    ...fragment,
    data: { observed, direction: even ? 'forward' : 'reverse' },
    summary: even
      ? `Repère ${derive.observation} = ${observed}, pair : lecture normale, du haut vers le bas et de gauche à droite.`
      : `Repère ${derive.observation} = ${observed}, impair : lecture inverse, du bas vers le haut et de droite à gauche.`,
  });
}
