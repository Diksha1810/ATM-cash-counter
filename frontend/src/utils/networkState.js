// Centralized network connectivity manager
let isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;
const subscribers = new Set();

export function getIsOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine && isOnlineState : isOnlineState;
}

export function setNetworkOnline(online) {
  if (isOnlineState !== online) {
    isOnlineState = online;
    subscribers.forEach((cb) => {
      try {
        cb(online);
      } catch (err) {
        console.error('Error in network subscriber:', err);
      }
    });
  }
}

export function subscribeNetworkStatus(callback) {
  subscribers.add(callback);
  callback(getIsOnline());
  return () => subscribers.delete(callback);
}

// Global browser listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setNetworkOnline(true));
  window.addEventListener('offline', () => setNetworkOnline(false));

  // Network Information API for instant detection when mobile data / Wi-Fi is toggled
  if (navigator.connection) {
    navigator.connection.addEventListener('change', () => {
      const isDown = navigator.connection.downlink === 0 || !navigator.onLine;
      setNetworkOnline(!isDown);
    });
  }
}
