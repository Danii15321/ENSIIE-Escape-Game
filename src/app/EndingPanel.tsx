import { useState } from 'react';
import { EndingView, type EndingModel } from '../presentation/components/EndingView';
import { readCapsule, saveCapsule, clearCapsule } from '../adapters/storage/capsule';
import { downloadText } from '../adapters/storage/local';
import { endingCopy, souvenirText } from './endings';
import { sourceRegistry } from './catalog';
export function EndingPanel({
  sessionId,
  model,
  onMemory,
  onHome,
}: {
  sessionId: string;
  model: EndingModel;
  onMemory: () => void;
  onHome: () => void;
}) {
  const [initial] = useState(() => {
    try {
      return readCapsule(window.localStorage, sessionId);
    } catch {
      return { text: '', notice: 'Le stockage local est indisponible.' };
    }
  });
  return (
    <EndingView
      copy={endingCopy}
      model={model}
      sources={sourceRegistry}
      initialMessage={initial.text}
      initialNotice={initial.notice}
      onSaveMessage={(text) => {
        try {
          return saveCapsule(window.localStorage, sessionId, text);
        } catch {
          return {
            ok: false,
            notice:
              'Le stockage local est indisponible. Copiez votre idée avant de quitter cet écran.',
          };
        }
      }}
      onClearMessage={() => {
        try {
          return clearCapsule(window.localStorage, sessionId);
        } catch {
          return { ok: false, notice: 'Le stockage local est indisponible.' };
        }
      }}
      onExport={(text) =>
        downloadText(
          souvenirText(endingCopy, model, text),
          `chrono-iie-souvenir-${sessionId}.txt`,
          'text/plain;charset=utf-8',
        )
      }
      onMemory={onMemory}
      onHome={onHome}
    />
  );
}
