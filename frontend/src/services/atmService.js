import { apiClient } from './apiClient';
import {
  saveCachedInventory,
  getCachedInventory,
  queueOfflineWithdrawal,
  getPendingWithdrawals,
  removePendingWithdrawal,
  updatePendingWithdrawal,
  getPendingCount,
  getPendingTransactions,
} from './offlineDb';
import { applyDispensation, findDispensation } from '../lib/dispensation';
import { getIsOnline, setNetworkOnline } from '../utils/networkState';

let syncInFlight = null;

function isConnectivityError(error) {
  // Always check live browser state first
  if (!navigator.onLine || !getIsOnline()) return true;
  // No HTTP status means network layer failed (DNS, TCP, TLS)
  if (!error.status) return true;
  // 408 was previously returned by our own service worker for offline assets
  if (error.status === 408) return true;
  return (
    ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ERR_INTERNET_DISCONNECTED'].includes(error.code) ||
    error.message === 'Network Error' ||
    (error.message && error.message.includes('timeout'))
  );
}

function createSyncId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const atmService = {
  async getInventory() {
    if (!getIsOnline()) {
      const cached = await getCachedInventory();
      if (cached) return cached;
    }
    try {
      const data = await apiClient.get('/atm/inventory', { timeout: 3000 });
      setNetworkOnline(true);
      await saveCachedInventory(data);
      return data;
    } catch (error) {
      if (isConnectivityError(error)) {
        setNetworkOnline(false);
      }
      const cached = await getCachedInventory();
      if (cached) return cached;
      throw error;
    }
  },

  async withdraw(amount, syncId = createSyncId()) {
    const queueWithdrawal = async (cached) => {
      let currentCached = cached;
      if (!currentCached) {
        currentCached = {
          balance: 35500,
          totalNotes: 104,
          denominations: [
            { denomination: 2000, quantity: 4, value: 8000 },
            { denomination: 500, quantity: 40, value: 20000 },
            { denomination: 200, quantity: 20, value: 4000 },
            { denomination: 100, quantity: 30, value: 3000 },
            { denomination: 50, quantity: 10, value: 500 },
          ],
        };
      }
      const notes = findDispensation(amount, currentCached.denominations);
      if (!notes) {
        throw new Error('This amount cannot be dispensed from the cached ATM notes.');
      }
      const queuedItem = {
        syncId,
        amount,
        dispensedNotes: notes,
        balanceBefore: currentCached.balance,
        balanceAfter: currentCached.balance - amount,
        createdAt: Date.now(),
        status: 'PENDING',
      };
      await queueOfflineWithdrawal(queuedItem);
      const optimistic = applyDispensation(currentCached, notes);
      await saveCachedInventory(optimistic);
      return {
        isOffline: true,
        inventory: optimistic,
        transaction: {
          _id: syncId,
          amount,
          status: 'PENDING',
          dispensedNotes: notes,
          balanceBefore: currentCached.balance,
          balanceAfter: optimistic.balance,
          createdAt: new Date().toISOString(),
        },
      };
    };

    if (!getIsOnline()) return queueWithdrawal(await getCachedInventory());

    try {
      // 2.5 second timeout so turning off data falls back to offline queueing promptly
      const data = await apiClient.post('/atm/withdraw', { amount, syncId }, { timeout: 2500 });
      setNetworkOnline(true);
      if (data?.transaction) {
        apiClient
          .get('/atm/inventory', { timeout: 2000 })
          .then((updatedInv) => saveCachedInventory(updatedInv))
          .catch(() => {});
      }
      return data;
    } catch (error) {
      if (isConnectivityError(error)) {
        setNetworkOnline(false);
        return queueWithdrawal(await getCachedInventory());
      }
      throw error;
    }
  },

  async syncPendingWithdrawals() {
    if (syncInFlight) return syncInFlight;

    syncInFlight = (async () => {
      if (!getIsOnline()) return null;
      const pending = await getPendingWithdrawals();
      if (!pending || pending.length === 0) return null;

      try {
        const response = await apiClient.post(
          '/atm/sync',
          {
            transactions: pending.map((p) => ({
              syncId: p.syncId,
              amount: p.amount,
            })),
          },
          { timeout: 6000 }
        );

        setNetworkOnline(true);
        for (const res of response.results || []) {
          if (res.status === 'SYNCED') {
            await removePendingWithdrawal(res.syncId);
          } else {
            await updatePendingWithdrawal(res.syncId, {
              status: res.status,
              error: res.message,
            });
          }
        }

        if (response.inventory) {
          await saveCachedInventory(response.inventory);
        }

        return response;
      } catch (err) {
        if (isConnectivityError(err)) {
          setNetworkOnline(false);
        }
        throw err;
      }
    })();

    try {
      return await syncInFlight;
    } finally {
      syncInFlight = null;
    }
  },

  async getPendingCount() {
    return await getPendingCount();
  },

  async getPendingTransactions() {
    return await getPendingTransactions();
  },
};
