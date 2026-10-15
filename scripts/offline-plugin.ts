import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build, type Plugin, type ResolvedConfig } from 'vite';
import { OFFLINE_MANIFEST } from '../src/core/ports/offline.ts';

export const WORKER_FILE = 'sw.js';

export function manifestFor(entries: { fileName: string; content: string | Uint8Array }[]) {
  const sorted = entries
    .filter(({ fileName }) => ![WORKER_FILE, OFFLINE_MANIFEST].includes(fileName))
    .filter(({ fileName }) => !fileName.endsWith('.map'))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
  const hash = createHash('sha256');
  for (const { fileName, content } of sorted) hash.update(fileName).update(content);
  return { version: hash.digest('hex').slice(0, 16), files: sorted.map((entry) => entry.fileName) };
}

export function offlinePlugin(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'chrono-iie-offline',
    apply: 'build',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
    },
    generateBundle(_, bundle) {
      const manifest = manifestFor(
        Object.values(bundle).map((item) => ({
          fileName: item.fileName,
          content: item.type === 'chunk' ? item.code : item.source,
        })),
      );
      if (!manifest.files.includes('index.html'))
        this.error('Le manifeste hors ligne doit contenir index.html');
      this.emitFile({
        type: 'asset',
        fileName: OFFLINE_MANIFEST,
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      });
    },
    async closeBundle() {
      await build({
        configFile: false,
        logLevel: 'warn',
        build: {
          outDir: config.build.outDir,
          emptyOutDir: false,
          copyPublicDir: false,
          minify: true,
          lib: {
            entry: fileURLToPath(new URL('../src/sw/sw.ts', import.meta.url)),
            formats: ['iife'],
            name: 'chronoIieWorker',
            fileName: () => WORKER_FILE,
          },
        },
      });
    },
  };
}
