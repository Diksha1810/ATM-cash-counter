import { useState, useEffect } from 'react';

export function useOfflineSync(onOnlineSync) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      if (typeof onOnlineSync === 'function') {
        onOnlineSync();
      }
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnlineSync]);

  return { isOnline };
}
