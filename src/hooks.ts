import { useSyncExternalStore } from 'react';

function scribeVisibilitychange(cb: () => void) {
  document.addEventListener('visibilitychange', cb, false);
  return () => document.removeEventListener('visibilitychange', cb, false);
}

export function useBrowserActive() {
  return useSyncExternalStore(scribeVisibilitychange, () => document.hidden);
}
