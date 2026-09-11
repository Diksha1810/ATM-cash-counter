import {openDB} from 'idb';
const dbPromise=openDB('atm-cash-counter',1,{upgrade(db){db.createObjectStore('kv');db.createObjectStore('pending',{keyPath:'syncId'});}});
export async function saveInventory(inventory){(await dbPromise).put('kv',inventory,'inventory')}
export async function getInventory(){return (await dbPromise).get('kv','inventory')}
export async function queueWithdrawal(item){(await dbPromise).put('pending',item)}
export async function getPending(){return (await dbPromise).getAll('pending')}
export async function removePending(syncId){(await dbPromise).delete('pending',syncId)}
export async function pendingCount(){return (await dbPromise).count('pending')}

export async function saveUser(user){(await dbPromise).put('kv',user,'user')}
export async function getUser(){return (await dbPromise).get('kv','user')}
export async function updatePending(syncId,patch){const db=await dbPromise;const item=await db.get('pending',syncId);if(item)await db.put('pending',{...item,...patch})}
