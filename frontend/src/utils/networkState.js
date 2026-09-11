// Centralized network connectivity manager.
// Always reads navigator.onLine as the ground truth, and also tracks our own
// observed state (from actual API call outcomes) so that "online" events
// that fire late on mobile don't cause false positives.
let isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;
const subscribers = new Set();

export function getIsOnline() {
  // navigator.onLine is the most reliable real-time check — always gate on it first.
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
  return isOnlineState;
}

export function setNetworkOnline(online) {
  // Also sync internal state even if subscriber notification would be a no-op
  isOnlineState = online;
  subscribers.forEach((cb) => {
    try {
      cb(online);
    } catch (err) {
      console.error('Error in network subscriber:', err);
    }
  });
}

export function subscribeNetworkStatus(callback) {
  subscribers.add(callback);
  // Notify with current state immediately
  callback(getIsOnline());
  return () => subscribers.delete(callback);
}

// Global browser event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setNetworkOnline(true));
  window.addEventListener('offline', () => setNetworkOnline(false));

  // Network Information API — fires on mobile data / Wi-Fi toggle events
  // much faster than 'online'/'offline' DOM events on Android/iOS
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    connection.addEventListener('change', () => {
      const effectivelyOffline = !navigator.onLine || connection.downlink === 0 || connection.type === 'none';
      setNetworkOnline(!effectivelyOffline);
    });
  }
}
