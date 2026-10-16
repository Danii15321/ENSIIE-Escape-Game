import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)],
  );
for (const file of [...walk(resolve(root, 'src')), ...walk(resolve(root, 'game'))]) {
  const name = relative(root, file).replaceAll('\\', '/');
  if (name.startsWith('game/') && /\.[cm]?[jt]sx?$/.test(name))
    errors.push(`${name} : les niveaux doivent rester déclaratifs`);
  if (!/\.tsx?$/.test(name)) continue;
  const source = readFileSync(file, 'utf8');
  const check = (specifier) => {
    const target = specifier.startsWith('.')
      ? relative(root, resolve(dirname(file), specifier)).replaceAll('\\', '/')
      : specifier;
    if (name.startsWith('src/core/') && !(target.startsWith('src/core/') || target === 'zod'))
      errors.push(`${name} : dépendance interdite ${target}`);
    if (
      name.startsWith('src/presentation/') &&
      !target.startsWith('src/presentation/') &&
      !target.startsWith('src/core/') &&
      !['react', 'react/jsx-runtime', 'react-dom', 'lucide-react', 'qrcode-generator'].includes(
        target,
      )
    )
      errors.push(`${name} : dépendance de présentation interdite ${target}`);
    if (
      name.startsWith('src/adapters/') &&
      !target.startsWith('src/adapters/') &&
      !target.startsWith('src/core/')
    )
      errors.push(`${name} : dépendance d’adaptateur interdite ${target}`);
  };
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g))
    check(match[1]);
  if (name.startsWith('src/core/') && /\b(window|localStorage|navigator|fetch)\s*[.(]/.test(source))
    errors.push(`${name} : accès navigateur dans le moteur`);
  if (name.startsWith('src/core/') && /\b(import\s*\(|require\s*\()/.test(source))
    errors.push(`${name} : import dynamique interdit dans le moteur`);
}
if (errors.length) {
  console.error([...new Set(errors)].join('\n'));
  process.exit(1);
}
console.log('Frontières vérifiées : moteur pur, présentation séparée, niveaux sans code.');
