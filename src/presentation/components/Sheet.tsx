import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const heading = useId();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    panel.current?.querySelector<HTMLElement>('h2')?.focus();
    return () => {
      if (opener.current instanceof HTMLElement && opener.current.isConnected)
        opener.current.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div className="sheet-layer" onClick={onClose}>
      <div
        ref={panel}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
          if (event.key !== 'Tab') return;
          const focusable = [
            ...(panel.current?.querySelectorAll<HTMLElement>('button, a[href], input, h2') ?? []),
          ].filter((element) => !(element as HTMLButtonElement).disabled);
          const first = focusable[0];
          const last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-head">
          <h2 id={heading} tabIndex={-1}>
            {title}
          </h2>
          <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
