import { useState, useEffect, useRef } from 'react';
import { getIsOnline, subscribeNetworkStatus } from '../utils/networkState';

export function useOfflineSync(onOnlineSync) {
  const [isOnline, setIsOnline] = useState(getIsOnline);
  const prevOnlineRef = useRef(isOnline);
  const onSyncRef = useRef(onOnlineSync);

  useEffect(() => {
    onSyncRef.current = onOnlineSync;
  }, [onOnlineSync]);

  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus((online) => {
      const wasOffline = !prevOnlineRef.current;
      prevOnlineRef.current = online;
      setIsOnline(online);

      // When transitioning from offline back to online, trigger auto-sync
      if (online && wasOffline && typeof onSyncRef.current === 'function') {
        onSyncRef.current().catch(() => {});
      }
    });

    // Initial check on mount
    if (getIsOnline() && typeof onSyncRef.current === 'function') {
      onSyncRef.current().catch(() => {});
    }

    return unsubscribe;
  }, []);

  return { isOnline };
}
