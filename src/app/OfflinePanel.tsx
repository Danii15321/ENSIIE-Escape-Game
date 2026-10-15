import { useEffect, useState } from 'react';
import type { OfflineStatus } from '../core/ports/offline';
import { browserOfflineCache, type offlineCache } from '../adapters/offline/cache';

type Offline = ReturnType<typeof offlineCache>;

const labels: Record<OfflineStatus['state'], string> = {
  unsupported: 'Indisponible ici',
  none: 'Non préparé',
  partial: 'Préparation incomplète',
  preparing: 'Préparation en cours',
  ready: 'Prêt hors ligne',
  outdated: 'Prêt hors ligne, mise à jour disponible',
  failed: 'Préparation interrompue',
};

export function OfflinePanel(props: { offline?: Offline | null }) {
  const [offline] = useState(() =>
    props.offline !== undefined
      ? props.offline
      : import.meta.env.PROD
        ? browserOfflineCache()
        : null,
  );
  const [status, setStatus] = useState<OfflineStatus>(
    offline
      ? { state: 'none', done: 0, total: 0, message: 'Vérification de la copie hors ligne…' }
      : {
          state: 'unsupported',
          done: 0,
          total: 0,
          message:
            'Le mode hors ligne fonctionne dans la version publiée, sur un navigateur récent en HTTPS.',
        },
  );
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    let active = true;
    offline?.inspect().then((next) => active && setStatus(next));
    return () => {
      active = false;
    };
  }, [offline]);
  const busy = status.state === 'preparing';
  const prepare = async () => {
    if (!offline) return;
    setStatus({ ...status, state: 'preparing', message: undefined });
    setStatus(await offline.prepare(setStatus));
  };
  const action =
    status.state === 'outdated'
      ? 'Mettre à jour la copie hors ligne'
      : status.state === 'partial' || status.state === 'failed'
        ? 'Reprendre la préparation'
        : status.state === 'ready'
          ? null
          : 'Préparer le mode hors ligne';
  return (
    <section className="panel" aria-label="Mode hors ligne">
      <h2>Mode hors ligne</h2>
      <p role="status">
        <strong>{labels[status.state]}</strong>
        {status.total ? ` (${status.done}/${status.total} fichiers)` : ''}
      </p>
      {busy ? <progress max={status.total || 1} value={status.done} /> : null}
      {status.message ? <p>{status.message}</p> : null}
      <p>
        Préparez l’appareil avec le réseau avant la partie. La sauvegarde de l’équipe reste à part :
        supprimer la copie hors ligne ne l’efface pas.
      </p>
      <div className="actions">
        {offline && action ? (
          <button disabled={busy} onClick={prepare}>
            {action}
          </button>
        ) : null}
        {offline && status.state !== 'none' && status.state !== 'unsupported' && !busy ? (
          <button onClick={() => setConfirmClear(true)}>Supprimer la copie hors ligne</button>
        ) : null}
      </div>
      {confirmClear ? (
        <div className="notice">
          <p>
            La copie hors ligne sera supprimée de cet appareil. La partie en cours est conservée.
          </p>
          <button
            onClick={async () => {
              setConfirmClear(false);
              if (offline) setStatus(await offline.clear());
            }}
          >
            Supprimer la copie
          </button>
          <button onClick={() => setConfirmClear(false)}>Annuler</button>
        </div>
      ) : null}
    </section>
  );
}
