import {
  isManifest,
  OFFLINE_CACHE_PREFIX,
  OFFLINE_MANIFEST,
  type OfflineManifest,
  type OfflineStatus,
} from '../../core/ports/offline';

export type CacheLike = {
  match(url: string): Promise<Response | undefined>;
  put(url: string, response: Response): Promise<void>;
};
export type CacheStorageLike = {
  open(name: string): Promise<CacheLike>;
  keys(): Promise<string[]>;
  delete(name: string): Promise<boolean>;
};
export type OfflineDeps = {
  caches: CacheStorageLike;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  base: string;
  workerActive: () => Promise<boolean>;
};

const cacheName = (version: string) => `${OFFLINE_CACHE_PREFIX}${version}`;

export function offlineCache(deps: OfflineDeps) {
  const url = (file: string) => new URL(file, deps.base).href;
  const manifestUrl = url(OFFLINE_MANIFEST);
  let running = false;

  async function fetchManifest(): Promise<OfflineManifest> {
    const response = await deps.fetch(manifestUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Manifeste indisponible (HTTP ${response.status})`);
    const manifest: unknown = await response.json();
    if (!isManifest(manifest)) throw new Error('Manifeste hors ligne invalide');
    return manifest;
  }

  async function count(cache: CacheLike, manifest: OfflineManifest) {
    let present = 0;
    for (const file of manifest.files) if (await cache.match(url(file))) present++;
    return present;
  }

  async function preparedCopy() {
    for (const name of await deps.caches.keys()) {
      if (!name.startsWith(OFFLINE_CACHE_PREFIX)) continue;
      const cache = await deps.caches.open(name);
      const marker = await cache.match(manifestUrl);
      const manifest: unknown = marker ? await marker.json().catch(() => null) : null;
      if (isManifest(manifest) && (await count(cache, manifest)) === manifest.files.length)
        return manifest;
    }
    return null;
  }

  async function readyStatus(manifest: OfflineManifest): Promise<OfflineStatus> {
    const total = manifest.files.length;
    if (await deps.workerActive())
      return { state: 'ready', version: manifest.version, done: total, total };
    return {
      state: 'partial',
      version: manifest.version,
      done: total,
      total,
      message:
        'Fichiers enregistrés. Rechargez la page une fois avec le réseau pour activer le mode hors ligne.',
    };
  }

  async function inspect(): Promise<OfflineStatus> {
    const prepared = await preparedCopy();
    let current: OfflineManifest;
    try {
      current = await fetchManifest();
    } catch {
      if (prepared) return readyStatus(prepared);
      return {
        state: 'none',
        done: 0,
        total: 0,
        message: 'Réseau indisponible : la préparation hors ligne n’a pas encore été faite.',
      };
    }
    if (prepared?.version === current.version) return readyStatus(prepared);
    const done = await count(await deps.caches.open(cacheName(current.version)), current);
    const total = current.files.length;
    if (prepared)
      return {
        state: 'outdated',
        version: prepared.version,
        done,
        total,
        message:
          'Une nouvelle version est publiée. La copie hors ligne actuelle reste utilisable ; mettez-la à jour entre deux parties.',
      };
    return { state: done > 0 ? 'partial' : 'none', version: current.version, done, total };
  }

  async function prepare(onProgress: (status: OfflineStatus) => void = () => {}) {
    if (running) return { state: 'preparing', done: 0, total: 0 } satisfies OfflineStatus;
    running = true;
    let done = 0;
    let total = 0;
    try {
      const manifest = await fetchManifest();
      total = manifest.files.length;
      const cache = await deps.caches.open(cacheName(manifest.version));
      for (const file of manifest.files) {
        if (!(await cache.match(url(file)))) {
          const response = await deps.fetch(url(file), { cache: 'reload' });
          if (!response.ok) throw new Error(`${file} : HTTP ${response.status}`);
          await cache.put(url(file), response);
        }
        done++;
        onProgress({ state: 'preparing', version: manifest.version, done, total });
      }
      if ((await count(cache, manifest)) !== total)
        throw new Error('Certains fichiers n’ont pas été conservés par le navigateur');
      await cache.put(
        manifestUrl,
        new Response(JSON.stringify(manifest), {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      for (const name of await deps.caches.keys())
        if (name.startsWith(OFFLINE_CACHE_PREFIX) && name !== cacheName(manifest.version))
          await deps.caches.delete(name);
      return await readyStatus(manifest);
    } catch (error) {
      const quota = error instanceof Error && error.name === 'QuotaExceededError';
      return {
        state: 'failed',
        done,
        total,
        message: quota
          ? 'Espace de stockage insuffisant sur cet appareil. Libérez de la place, puis reprenez la préparation.'
          : `Préparation interrompue (${done}/${total}) : ${error instanceof Error ? error.message : String(error)}. Les fichiers déjà enregistrés sont conservés ; reprenez quand le réseau est disponible.`,
      } satisfies OfflineStatus;
    } finally {
      running = false;
    }
  }

  async function clear(): Promise<OfflineStatus> {
    for (const name of await deps.caches.keys())
      if (name.startsWith(OFFLINE_CACHE_PREFIX)) await deps.caches.delete(name);
    return { state: 'none', done: 0, total: 0 };
  }

  return { inspect, prepare, clear };
}

export function browserOfflineCache(): ReturnType<typeof offlineCache> | null {
  if (typeof window === 'undefined' || !('caches' in window) || !('serviceWorker' in navigator))
    return null;
  return offlineCache({
    caches: window.caches as unknown as CacheStorageLike,
    fetch: (input, init) => window.fetch(input, init),
    base: document.baseURI,
    workerActive: async () => Boolean(navigator.serviceWorker.controller),
  });
}
