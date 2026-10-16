import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import qrcode from 'qrcode-generator';

const repo = process.cwd();
const out = join(repo, 'docs/presentation/chrono-iie-presentation.html');
const nm = join(repo, 'node_modules');
const b64 = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`;

const fonts = {
  inter: '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  grotesk: '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
  serif: '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2',
  mono400: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
  mono600: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2',
};

const attrs = (o) =>
  Object.entries(o)
    .filter(([k]) => k !== 'key')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
async function icon(name) {
  const file = join(nm, 'lucide-react/dist/esm/icons', `${name}.mjs`);
  if (!existsSync(file)) throw new Error(`Icône absente : ${name}`);
  const { __iconData } = await import(pathToFileURL(file).href);
  const inner = __iconData.node.map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join('');
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}

const R = 38;
const C = 2 * Math.PI * R;
let uid = 0;
function ariie(integrity, size, mode = '') {
  const id = `a${uid++}`;
  const ratio = integrity / 100;
  const span = integrity >= 100 ? 120 : 70 + ratio * 46;
  const scatter = Math.max(0, (0.4 - ratio) / 0.4) * 8;
  const arcs = [0, 1, 2]
    .map((i) => {
      const start = i * 120 - 90 + (120 - span) / 2;
      const mid = ((start + span / 2) * Math.PI) / 180;
      const dx = (Math.cos(mid) * scatter).toFixed(2);
      const dy = (Math.sin(mid) * scatter).toFixed(2);
      return `<circle class="ariie-arc" cx="60" cy="60" r="${R}" stroke-dasharray="${((span / 360) * C).toFixed(2)} ${C.toFixed(2)}" style="transform: translate(${dx}px, ${dy}px) rotate(${start.toFixed(2)}deg)"/>`;
    })
    .join('');
  const stroke = mode === 'brand' ? `url(#${id}g)` : 'currentColor';
  return `<svg class="ariie${mode === 'broken' ? ' is-broken' : ''}" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true"><defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e7b56a"/><stop offset="55%" stop-color="#70d6e7"/><stop offset="100%" stop-color="#beaff5"/></linearGradient><radialGradient id="${id}h"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="currentColor" stop-opacity="0.9"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs><g class="ariie-dial"><circle cx="60" cy="60" r="55" class="ariie-ticks"/></g><g class="ariie-arcs" stroke="${stroke}">${arcs}</g><circle class="ariie-halo" cx="60" cy="60" r="20" fill="url(#${id}h)"/><circle class="ariie-core" cx="60" cy="60" r="6.5"/></svg>`;
}

const ticks = Array.from({ length: 60 }, (_, t) => {
  const major = t % 5 === 0;
  return `<line x1="0" y1="${major ? -96 : -92}" x2="0" y2="-88" transform="rotate(${t * 6})"${major ? ' class="major"' : ''}/>`;
}).join('');
const dial = `<svg class="dial" viewBox="-100 -100 200 200" aria-hidden="true"><circle r="96"/><circle r="78"/>${ticks}</svg>`;

function qr(url) {
  const code = qrcode(0, 'M');
  code.addData(url, 'Byte');
  code.make();
  const size = code.getModuleCount();
  let path = '';
  for (let row = 0; row < size; row++)
    for (let col = 0; col < size; col++)
      if (code.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`;
  return `<svg viewBox="-2 -2 ${size + 4} ${size + 4}" shape-rendering="crispEdges" role="img" aria-label="Code QR : ${url}"><rect x="-2" y="-2" width="${size + 4}" height="${size + 4}" fill="#ffffff"/><path d="${path}" fill="#0b141b"/></svg>`;
}

let html = readFileSync(join(repo, 'docs/presentation/source.html'), 'utf8');
const icons = [...new Set([...html.matchAll(/\{\{icon:([a-z0-9-]+)\}\}/g)].map((m) => m[1]))];
for (const name of icons) html = html.replaceAll(`{{icon:${name}}}`, await icon(name));
html = html.replace(/\{\{font:(\w+)\}\}/g, (_, k) => b64(join(nm, fonts[k]), 'font/woff2'));
html = html.replace(/\{\{img:([\w-]+)\}\}/g, (_, k) =>
  b64(join(repo, 'src/presentation/theme/media', `${k}.jpg`), 'image/jpeg'),
);
html = html.replace(/\{\{ariie:(\d+):(\d+)(?::(\w+))?\}\}/g, (_, i, s, m) => ariie(+i, +s, m));
html = html.replaceAll('{{dial}}', dial);
html = html.replace(/\{\{qr:([^}]+)\}\}/g, (_, url) => qr(url));
const left = html.match(/\{\{[^}]*\}\}/);
if (left) throw new Error(`Marqueur non remplacé : ${left[0]}`);
if (html.includes(String.fromCharCode(0x2014))) throw new Error('Tiret cadratin interdit');
writeFileSync(out, html);
console.log(`${out} : ${(html.length / 1024).toFixed(0)} Ko, ${icons.length} icônes`);
