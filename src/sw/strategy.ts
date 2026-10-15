import { isManifest, OFFLINE_CACHE_PREFIX, OFFLINE_MANIFEST } from '../core/ports/offline';

type CacheLike = { match(url: string): Promise<Response | undefined> };
export type WorkerEnv = {
  scope: string;
  caches: { keys(): Promise<string[]>; open(name: string): Promise<CacheLike> };
  fetch: (request: Request) => Promise<Response>;
};

export async function preparedCache(env: WorkerEnv): Promise<CacheLike | null> {
  const marker = new URL(OFFLINE_MANIFEST, env.scope).href;
  for (const name of await env.caches.keys()) {
    if (!name.startsWith(OFFLINE_CACHE_PREFIX)) continue;
    const cache = await env.caches.open(name);
    const response = await cache.match(marker);
    if (
      response &&
      isManifest(
        await response
          .clone()
          .json()
          .catch(() => null),
      )
    )
      return cache;
  }
  return null;
}

export async function respond(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  const scope = new URL(env.scope);
  const local =
    request.method === 'GET' &&
    url.origin === scope.origin &&
    url.pathname.startsWith(scope.pathname) &&
    !url.pathname.endsWith('/sw.js');
  if (!local) return env.fetch(request);
  const cache = await preparedCache(env);
  if (!cache) return env.fetch(request);
  const path = `${url.origin}${url.pathname}`;
  if (url.pathname.endsWith(`/${OFFLINE_MANIFEST}`)) {
    try {
      return await env.fetch(request);
    } catch (error) {
      const copy = await cache.match(path);
      if (copy) return copy;
      throw error;
    }
  }
  const key = request.mode === 'navigate' ? new URL('index.html', env.scope).href : path;
  return (await cache.match(key)) ?? env.fetch(request);
}
