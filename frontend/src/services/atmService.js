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
  return !error.status && ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error.code);
}

function createSyncId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const atmService = {
  async getInventory() {
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
      const notes = cached && findDispensation(amount, cached.denominations);
      if (!cached || !notes) {
        throw new Error('This amount cannot be dispensed from the cached ATM notes.');
      }
      const queuedItem = {
        syncId,
        amount,
        dispensedNotes: notes,
        balanceBefore: cached.balance,
        balanceAfter: cached.balance - amount,
        createdAt: Date.now(),
        status: 'PENDING',
      };
      await queueOfflineWithdrawal(queuedItem);
      const optimistic = applyDispensation(cached, notes);
      await saveCachedInventory(optimistic);
      return {
        isOffline: true,
        transaction: {
          _id: syncId,
          amount,
          status: 'PENDING',
          dispensedNotes: notes,
          balanceBefore: cached.balance,
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
