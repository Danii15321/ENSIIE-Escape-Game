import { useId, useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';
import { ExternalLink, QrCode as QrIcon, X } from 'lucide-react';

const QUIET = 4;

export function qrPath(value: string): { size: number; path: string } {
  const qr = qrcode(0, 'M');
  qr.addData(value, 'Byte');
  qr.make();
  const size = qr.getModuleCount();
  let path = '';
  for (let row = 0; row < size; row++)
    for (let col = 0; col < size; col++) if (qr.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`;
  return { size, path };
}

export function QrCode({
  value,
  label,
  size = 220,
}: {
  value: string;
  label: string;
  size?: number;
}) {
  const { size: modules, path } = useMemo(() => qrPath(value), [value]);
  const box = modules + QUIET * 2;
  return (
    <svg
      className="qr-code"
      role="img"
      aria-label={`Code QR : ${label}`}
      width={size}
      height={size}
      viewBox={`${-QUIET} ${-QUIET} ${box} ${box}`}
      shapeRendering="crispEdges"
    >
      <rect x={-QUIET} y={-QUIET} width={box} height={box} fill="#ffffff" />
      <path d={path} fill="#0b141b" />
    </svg>
  );
}

export function SourceLink({ title, url }: { title: string; url: string }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <span className="source-link">
      <span className="source-row">
        <a href={url} target="_blank" rel="noreferrer">
          {title}
          <span className="sr-only"> (nouvel onglet)</span>
          <ExternalLink aria-hidden="true" size={14} />
        </a>
        <button
          type="button"
          className="qr-toggle"
          aria-expanded={open}
          aria-controls={panel}
          aria-label={`${open ? 'Masquer' : 'Afficher'} le code QR : ${title}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" size={16} /> : <QrIcon aria-hidden="true" size={16} />}
          QR
        </button>
      </span>
      {open ? (
        <span id={panel} className="qr-panel">
          <QrCode value={url} label={title} />
          <span className="qr-caption">Scannez pour ouvrir la source sur un autre téléphone.</span>
        </span>
      ) : null}
    </span>
  );
}
