import { respond, type WorkerEnv } from './strategy';

type ExtendableEvent = Event & { waitUntil(promise: Promise<unknown>): void };
type FetchEvent = ExtendableEvent & {
  request: Request;
  respondWith(response: Promise<Response>): void;
};
type WorkerScope = {
  addEventListener(type: 'install' | 'activate', listener: (event: ExtendableEvent) => void): void;
  addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void;
  skipWaiting(): Promise<void>;
  clients: { claim(): Promise<void> };
  registration: { scope: string };
  caches: WorkerEnv['caches'];
  fetch: WorkerEnv['fetch'];
};

const worker = self as unknown as WorkerScope;
const env: WorkerEnv = {
  scope: worker.registration.scope,
  caches: worker.caches,
  fetch: (request) => worker.fetch(request),
};

worker.addEventListener('install', (event) => event.waitUntil(worker.skipWaiting()));
worker.addEventListener('activate', (event) => event.waitUntil(worker.clients.claim()));
worker.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') event.respondWith(respond(event.request, env));
});
