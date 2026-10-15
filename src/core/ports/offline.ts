export const OFFLINE_MANIFEST = 'offline-manifest.json';
export const OFFLINE_CACHE_PREFIX = 'chrono-iie-offline-';

export type OfflineManifest = { version: string; files: string[] };

export type OfflineState =
  'unsupported' | 'none' | 'partial' | 'preparing' | 'ready' | 'outdated' | 'failed';

export type OfflineStatus = {
  state: OfflineState;
  version?: string;
  done: number;
  total: number;
  message?: string;
};

export function isManifest(value: unknown): value is OfflineManifest {
  if (typeof value !== 'object' || value === null) return false;
  const { version, files } = value as Record<string, unknown>;
  return (
    typeof version === 'string' &&
    /^[a-f0-9]{8,64}$/.test(version) &&
    Array.isArray(files) &&
    files.length > 0 &&
    files.every(
      (file) =>
        typeof file === 'string' &&
        file !== '' &&
        !file.startsWith('/') &&
        !file.includes('..') &&
        !/^[a-z]+:/i.test(file),
    ) &&
    new Set(files).size === files.length
  );
}
