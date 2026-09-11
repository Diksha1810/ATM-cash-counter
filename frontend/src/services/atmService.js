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

let syncInFlight = null;

function isConnectivityError(error) {
  if (!navigator.onLine) return true;
  if (!error.status) return true;
  return (
    ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ERR_INTERNET_DISCONNECTED'].includes(error.code) ||
    error.message === 'Network Error'
  );
}

function createSyncId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const atmService = {
  async getInventory() {
    if (!navigator.onLine) {
      const cached = await getCachedInventory();
      if (cached) return cached;
    }
    try {
      const data = await apiClient.get('/atm/inventory');
      await saveCachedInventory(data);
      return data;
    } catch (error) {
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

    if (!navigator.onLine) return queueWithdrawal(await getCachedInventory());

    try {
      const data = await apiClient.post('/atm/withdraw', { amount, syncId });
      if (data?.transaction) {
        const updatedInv = await apiClient.get('/atm/inventory');
        await saveCachedInventory(updatedInv);
      }
      return data;
    } catch (error) {
      if (isConnectivityError(error)) {
        return queueWithdrawal(await getCachedInventory());
      }
      throw error;
    }
  },

  async syncPendingWithdrawals() {
    if (syncInFlight) return syncInFlight;

    syncInFlight = (async () => {
      if (!navigator.onLine) return null;
      const pending = await getPendingWithdrawals();
      if (!pending || pending.length === 0) return null;

      const response = await apiClient.post('/atm/sync', {
        transactions: pending.map((p) => ({
          syncId: p.syncId,
          amount: p.amount,
        })),
      });

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
