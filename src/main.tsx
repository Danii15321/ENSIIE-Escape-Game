import React from 'react';
import ReactDOM from 'react-dom/client';
import './presentation/theme/global.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: String(error) };
  }
  render() {
    return this.state.error ? (
      <main>
        <h1>Le contenu ne peut pas être chargé</h1>
        <p role="alert">{this.state.error}</p>
        <p>
          Vérifiez le paquet de niveau avec npm run check:content. La sauvegarde n’a pas été
          effacée.
        </p>
      </main>
    ) : (
      this.props.children
    );
  }
}
if (import.meta.env.PROD && 'serviceWorker' in navigator)
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);

const root = ReactDOM.createRoot(document.getElementById('root')!);
import('./app/App')
  .then(({ App }) => {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    root.render(
      <main>
        <h1>Contenu invalide</h1>
        <p role="alert">{String(error)}</p>
        <p>Exécutez npm run check:content. La sauvegarde reste intacte.</p>
      </main>,
    );
  });
