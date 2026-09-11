import { openDB } from 'idb';

const DB_NAME = 'atm-cash-counter-db';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('kv')) {
      db.createObjectStore('kv');
    }
    if (!db.objectStoreNames.contains('pending')) {
      db.createObjectStore('pending', { keyPath: 'syncId' });
    }
  },
});

export async function saveCachedInventory(inventory) {
  const db = await dbPromise;
  await db.put('kv', inventory, 'inventory');
}

export async function getCachedInventory() {
  const db = await dbPromise;
  return await db.get('kv', 'inventory');
}

export async function saveCachedUser(user) {
  const db = await dbPromise;
  await db.put('kv', user, 'user');
}

export async function getCachedUser() {
  const db = await dbPromise;
  return await db.get('kv', 'user');
}

export async function clearCachedUser() {
  const db = await dbPromise;
  await db.delete('kv', 'user');
}

export async function queueOfflineWithdrawal(item) {
  const db = await dbPromise;
  await db.put('pending', item);
}

export async function getPendingWithdrawals() {
  const db = await dbPromise;
  return await db.getAll('pending');
}

export async function removePendingWithdrawal(syncId) {
  const db = await dbPromise;
  await db.delete('pending', syncId);
}

export async function updatePendingWithdrawal(syncId, updates) {
  const db = await dbPromise;
  const item = await db.get('pending', syncId);
  if (item) {
    await db.put('pending', { ...item, ...updates });
  }
}

export async function getPendingCount() {
  const db = await dbPromise;
  return await db.count('pending');
}

export async function getPendingTransactions() {
  const pending = await getPendingWithdrawals();
  return pending.map((item) => ({
    _id: item.syncId,
    amount: item.amount,
    status: item.status || 'PENDING',
    dispensedNotes: item.dispensedNotes || [],
    balanceBefore: item.balanceBefore,
    balanceAfter: item.balanceAfter,
    createdAt: item.createdAt,
  }));
}
