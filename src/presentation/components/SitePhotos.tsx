import { createContext, useContext, type ReactNode } from 'react';

type Resolve = (siteId: string, file: string) => string | undefined;
const SitePhotosContext = createContext<Resolve>(() => undefined);

export function SitePhotosProvider({
  resolve,
  children,
}: {
  resolve: Resolve;
  children: ReactNode;
}) {
  return <SitePhotosContext.Provider value={resolve}>{children}</SitePhotosContext.Provider>;
}

export const useSitePhoto = () => useContext(SitePhotosContext);
