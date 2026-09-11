import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { atmService } from '../services/atmService';
import { toast } from 'react-toastify';
import { QUERY_KEYS, MUTATION_KEYS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export function useATM() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [lastWithdrawal, setLastWithdrawal] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const inventoryQuery = useQuery({
    queryKey: [QUERY_KEYS.INVENTORY],
    queryFn: atmService.getInventory,
    enabled: isAuthenticated,
    networkMode: 'always',
    staleTime: 30 * 1000,
  });

  const pendingCountQuery = useQuery({
    queryKey: [QUERY_KEYS.PENDING_COUNT],
    queryFn: atmService.getPendingCount,
    enabled: isAuthenticated,
    networkMode: 'always',
    refetchInterval: 5000,
  });

  const withdrawMutation = useMutation({
    mutationKey: [MUTATION_KEYS.WITHDRAW],
    mutationFn: (amount) => atmService.withdraw(amount),
    networkMode: 'always',
    onSuccess: (data) => {
      if (data.isOffline) {
        if (data.inventory) {
          queryClient.setQueryData([QUERY_KEYS.INVENTORY], data.inventory);
        }
        queryClient.setQueryData([QUERY_KEYS.PENDING_COUNT], (prev = 0) => prev + 1);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_TRANSACTIONS] });
        toast.warning(
          'You are offline. This withdrawal is queued locally and will be synced when reconnected.',
          { toastId: 'offline-queue' }
        );
        setLastWithdrawal(data.transaction);
        setIsResultModalOpen(true);
      } else {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_COUNT] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_TRANSACTIONS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
        toast.success('Cash dispensed successfully!');
        setLastWithdrawal(data.transaction);
        setIsResultModalOpen(true);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Withdrawal failed');
    },
  });

  const syncMutation = useMutation({
    mutationKey: [MUTATION_KEYS.SYNC_PENDING],
    mutationFn: atmService.syncPendingWithdrawals,
    networkMode: 'always',
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_COUNT] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_TRANSACTIONS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });

        const syncedCount = data.results?.filter((r) => r.status === 'SYNCED').length || 0;
        const failedCount = data.results?.filter((r) => r.status !== 'SYNCED').length || 0;

        if (syncedCount > 0) {
          toast.success(`Sync complete — ${syncedCount} transaction(s) synchronized.`);
        }
        if (failedCount > 0) {
          toast.error(`${failedCount} transaction(s) could not be processed due to stock conflicts.`);
        }
      }
    },
  });

  return {
    inventory: inventoryQuery.data,
    isLoadingInventory: inventoryQuery.isLoading,
    refetchInventory: inventoryQuery.refetch,
    pendingCount: pendingCountQuery.data || 0,
    withdraw: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
    syncPending: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    lastWithdrawal,
    isResultModalOpen,
    setIsResultModalOpen,
    closeResultModal: () => setIsResultModalOpen(false),
  };
}
