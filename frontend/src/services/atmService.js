import { apiClient } from './apiClient';
import {
  saveCachedInventory,
  getCachedInventory,
  queueOfflineWithdrawal,
  getPendingWithdrawals,
  removePendingWithdrawal,
  updatePendingWithdrawal,
  getPendingCount,
} from './offlineDb';

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

  async withdraw(amount, syncId = crypto.randomUUID()) {
    if (!navigator.onLine) {
      const cached = await getCachedInventory();
      if (!cached || amount > cached.balance) {
        throw new Error('Offline withdrawal exceeds known ATM balance.');
      }
      const queuedItem = {
        syncId,
        amount,
        createdAt: Date.now(),
        status: 'PENDING',
      };
      await queueOfflineWithdrawal(queuedItem);
      const optimistic = {
        ...cached,
        balance: cached.balance - amount,
      };
      await saveCachedInventory(optimistic);
      return {
        isOffline: true,
        transaction: {
          _id: syncId,
          amount,
          status: 'PENDING',
          dispensedNotes: [],
          balanceBefore: cached.balance,
          balanceAfter: optimistic.balance,
          createdAt: new Date().toISOString(),
        },
      };
    }

    const data = await apiClient.post('/atm/withdraw', { amount, syncId });
    if (data?.transaction) {
      const updatedInv = await apiClient.get('/atm/inventory');
      await saveCachedInventory(updatedInv);
    }
    return data;
  },

  async syncPendingWithdrawals() {
    if (!navigator.onLine) return null;
    const pending = await getPendingWithdrawals();
    if (!pending || pending.length === 0) return null;

    const payload = {
      transactions: pending.map((p) => ({
        syncId: p.syncId,
        amount: p.amount,
      })),
    };

    const response = await apiClient.post('/atm/sync', payload);

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
  },

  async getPendingCount() {
    return await getPendingCount();
  },
};
