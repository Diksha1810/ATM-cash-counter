/**
 * Centralized TanStack Query keys.
 * Always import from here — never write raw strings inline.
 */
export const QUERY_KEYS = {
  AUTH_USER: 'authUser',
  INVENTORY: 'inventory',
  PENDING_COUNT: 'pendingCount',
  TRANSACTIONS: 'transactions',
};

/**
 * Centralized TanStack Mutation keys.
 * Helps with devtools labelling and cache invalidation targeting.
 */
export const MUTATION_KEYS = {
  LOGIN: 'login',
  REGISTER: 'register',
  LOGOUT: 'logout',
  WITHDRAW: 'withdraw',
  SYNC_PENDING: 'syncPending',
};
