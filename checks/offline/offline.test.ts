import { describe, expect, it } from 'vitest';
import { offlineCache, type CacheStorageLike } from '../../src/adapters/offline/cache';
import { isManifest, OFFLINE_MANIFEST } from '../../src/core/ports/offline';
import { respond, type WorkerEnv } from '../../src/sw/strategy';
import { manifestFor } from '../../scripts/offline-plugin';

const BASE = 'https://chrono.test/app/';
const files = ['index.html', 'assets/App-1.js', 'assets/index-2.js', 'assets/index-3.css'];

function fakeCaches() {
  const store = new Map<string, Map<string, string>>();
  let quotaAfter = Infinity;
  const caches: CacheStorageLike & { store: typeof store; failPutAfter(n: number): void } = {
    store,
    failPutAfter(n) {
      quotaAfter = n;
    },
    async open(name) {
      if (!store.has(name)) store.set(name, new Map());
      const entries = store.get(name)!;
      return {
        async match(url) {
          const body = entries.get(url);
          return body === undefined ? undefined : new Response(body);
        },
        async put(url, response) {
          if (quotaAfter-- <= 0)
            throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
          entries.set(url, await response.text());
        },
      };
    },
    async keys() {
      return [...store.keys()];
    },
    async delete(name) {
      return store.delete(name);
    },
  };
  return caches;
}

function fakeServer(version = 'aaaaaaaa11111111') {
  const server = {
    manifest: { version, files } as unknown,
    online: true,
    failOn: new Set<string>(),
    calls: [] as string[],
    async fetch(url: string) {
      server.calls.push(url);
      if (!server.online || server.failOn.has(url)) throw new TypeError('Failed to fetch');
      if (url === `${BASE}${OFFLINE_MANIFEST}`) return Response.json(server.manifest);
      return files.some((file) => `${BASE}${file}` === url)
        ? new Response(`content of ${url}`)
        : new Response('missing', { status: 404 });
    },
  };
  return server;
}

function setup(workerActive = true) {
  const caches = fakeCaches();
  const server = fakeServer();
  const offline = offlineCache({
    caches,
    fetch: (url) => server.fetch(url),
    base: BASE,
    workerActive: async () => workerActive,
  });
  return { caches, server, offline };
}

describe('Préparation hors ligne', () => {
  it('ne promet rien lors d’une première visite', async () => {
    const { offline } = setup();
    expect(await offline.inspect()).toMatchObject({ state: 'none', done: 0, total: 4 });
  });

  it('prépare tous les fichiers puis annonce seulement alors la disponibilité', async () => {
    const { offline, caches } = setup();
    const progress: number[] = [];
    const status = await offline.prepare((step) => progress.push(step.done));
    expect(status).toMatchObject({ state: 'ready', done: 4, total: 4 });
    expect(progress).toEqual([1, 2, 3, 4]);
    const cache = caches.store.get('chrono-iie-offline-aaaaaaaa11111111')!;
    expect([...cache.keys()].sort()).toEqual(
      [...files, OFFLINE_MANIFEST].map((file) => `${BASE}${file}`).sort(),
    );
    expect(await offline.inspect()).toMatchObject({ state: 'ready' });
  });

  it('reprend une préparation interrompue sans retélécharger les fichiers acquis', async () => {
    const { offline, server } = setup();
    server.failOn.add(`${BASE}assets/index-2.js`);
    const failed = await offline.prepare();
    expect(failed).toMatchObject({ state: 'failed', done: 2, total: 4 });
    expect(failed.message).toContain('reprenez');
    expect(await offline.inspect()).toMatchObject({ state: 'partial', done: 2, total: 4 });
    server.failOn.clear();
    server.calls = [];
    expect(await offline.prepare()).toMatchObject({ state: 'ready' });
    expect(server.calls).toEqual([
      `${BASE}${OFFLINE_MANIFEST}`,
      `${BASE}assets/index-2.js`,
      `${BASE}assets/index-3.css`,
    ]);
  });

  it('signale un espace insuffisant et un fichier introuvable', async () => {
    const quota = setup();
    quota.caches.failPutAfter(1);
    const status = await quota.offline.prepare();
    expect(status.state).toBe('failed');
    expect(status.message).toContain('Espace de stockage insuffisant');
    const missing = setup();
    missing.server.manifest = { version: 'bbbbbbbb22222222', files: [...files, 'gone.png'] };
    expect((await missing.offline.prepare()).message).toContain('gone.png : HTTP 404');
    expect(await missing.offline.inspect()).toMatchObject({ state: 'partial' });
  });

  it('refuse un manifeste invalide ou qui sort de l’application', async () => {
    for (const manifest of [
      { version: 'aaaaaaaa11111111', files: ['../secret'] },
      { version: 'aaaaaaaa11111111', files: ['https://evil.test/x.js'] },
      { version: 'aaaaaaaa11111111', files: ['/index.html'] },
      { version: 'NOPE', files },
      { version: 'aaaaaaaa11111111', files: ['index.html', 'index.html'] },
    ]) {
      expect(isManifest(manifest)).toBe(false);
      const { offline, server } = setup();
      server.manifest = manifest;
      expect(await offline.prepare()).toMatchObject({ state: 'failed' });
    }
  });

  it('demande un rechargement tant que le service hors ligne n’est pas actif', async () => {
    const { offline } = setup(false);
    const status = await offline.prepare();
    expect(status.state).toBe('partial');
    expect(status.message).toContain('Rechargez');
  });

  it('garde la copie préparée hors réseau et ne bascule vers une nouvelle version qu’à la demande', async () => {
    const { offline, server, caches } = setup();
    await offline.prepare();
    server.online = false;
    expect(await offline.inspect()).toMatchObject({ state: 'ready', version: 'aaaaaaaa11111111' });
    server.online = true;
    server.manifest = { version: 'cccccccc33333333', files };
    expect(await offline.inspect()).toMatchObject({
      state: 'outdated',
      version: 'aaaaaaaa11111111',
    });
    expect(caches.store.has('chrono-iie-offline-aaaaaaaa11111111')).toBe(true);
    expect(await offline.prepare()).toMatchObject({ state: 'ready', version: 'cccccccc33333333' });
    expect([...caches.store.keys()]).toEqual(['chrono-iie-offline-cccccccc33333333']);
  });

  it('efface seulement la copie hors ligne, jamais les autres données', async () => {
    const { offline, caches } = setup();
    await offline.prepare();
    await caches.open('other-app');
    const save = new Map([['chrono-iie:session:v1', '{"team":"A"}']]);
    expect(await offline.clear()).toMatchObject({ state: 'none' });
    expect([...caches.store.keys()]).toEqual(['other-app']);
    expect(save.get('chrono-iie:session:v1')).toBe('{"team":"A"}');
    expect(await offline.inspect()).toMatchObject({ state: 'none' });
  });

  it('ignore une seconde préparation lancée pendant la première', async () => {
    const { offline, server } = setup();
    const [first, second] = await Promise.all([offline.prepare(), offline.prepare()]);
    expect(first.state).toBe('ready');
    expect(second.state).toBe('preparing');
    expect(server.calls.filter((url) => url.endsWith(OFFLINE_MANIFEST))).toHaveLength(1);
  });
});

describe('Service hors ligne', () => {
  const request = (url: string, mode = 'cors', method = 'GET') =>
    ({ url, mode, method }) as unknown as Request;
  async function prepared(online = true) {
    const { offline, caches } = setup();
    await offline.prepare();
    const network: string[] = [];
    const env: WorkerEnv = {
      scope: BASE,
      caches,
      fetch: async (req) => {
        network.push(req.url);
        if (!online) throw new TypeError('offline');
        return new Response(`network ${req.url}`);
      },
    };
    return { env, network };
  }

  it('laisse passer le réseau tant qu’aucune copie n’est préparée', async () => {
    const network: string[] = [];
    const env: WorkerEnv = {
      scope: BASE,
      caches: fakeCaches(),
      fetch: async (req) => (network.push(req.url), new Response('net')),
    };
    expect(await (await respond(request(`${BASE}assets/App-1.js`), env)).text()).toBe('net');
    expect(network).toHaveLength(1);
  });

  it('sert application, niveaux et navigation sans réseau', async () => {
    const { env, network } = await prepared(false);
    const asset = await respond(request(`${BASE}assets/App-1.js?v=1`), env);
    expect(await asset.text()).toBe(`content of ${BASE}assets/App-1.js`);
    const page = await respond(request(`${BASE}?level=syn-02`, 'navigate'), env);
    expect(await page.text()).toBe(`content of ${BASE}index.html`);
    const manifest = await respond(request(`${BASE}${OFFLINE_MANIFEST}`), env);
    expect(isManifest(await manifest.json())).toBe(true);
    expect(network).toEqual([`${BASE}${OFFLINE_MANIFEST}`]);
  });

  it('garde la version préparée pour la navigation même en ligne', async () => {
    const { env, network } = await prepared(true);
    const page = await respond(request(`${BASE}`, 'navigate'), env);
    expect(await page.text()).toBe(`content of ${BASE}index.html`);
    const manifest = await respond(request(`${BASE}${OFFLINE_MANIFEST}`), env);
    expect(await manifest.text()).toContain('network');
    expect(network).toEqual([`${BASE}${OFFLINE_MANIFEST}`]);
  });

  it('ne touche ni aux écritures, ni aux autres origines, ni au script du service', async () => {
    const { env, network } = await prepared(true);
    await respond(request(`${BASE}assets/App-1.js`, 'cors', 'POST'), env);
    await respond(request('https://legifrance.test/decret'), env);
    await respond(request(`${BASE}sw.js`), env);
    await respond(request('https://chrono.test/other/index.html'), env);
    expect(network).toHaveLength(4);
  });
});

describe('Manifeste de build', () => {
  it('liste les fichiers publiés et change de version avec leur contenu', () => {
    const entries = [
      { fileName: 'index.html', content: '<html>' },
      { fileName: 'assets/a.js', content: 'a' },
      { fileName: 'assets/a.js.map', content: '{}' },
      { fileName: 'sw.js', content: 'sw' },
      { fileName: OFFLINE_MANIFEST, content: '{}' },
    ];
    const manifest = manifestFor(entries);
    expect(manifest.files).toEqual(['assets/a.js', 'index.html']);
    expect(isManifest(manifest)).toBe(true);
    expect(manifestFor([...entries].reverse()).version).toBe(manifest.version);
    expect(
      manifestFor([
        { fileName: 'index.html', content: '<html>' },
        { fileName: 'assets/a.js', content: 'b' },
      ]).version,
    ).not.toBe(manifest.version);
  });
});
