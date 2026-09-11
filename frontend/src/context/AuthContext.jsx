import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { QUERY_KEYS, MUTATION_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.AUTH_USER],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationKey: [MUTATION_KEYS.LOGIN],
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.AUTH_USER], data.user);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      toast.success('Logged in successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationKey: [MUTATION_KEYS.REGISTER],
    mutationFn: ({ email, password }) => authService.register(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.AUTH_USER], data.user);
      toast.success('Account created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationKey: [MUTATION_KEYS.LOGOUT],
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData([QUERY_KEYS.AUTH_USER], null);
      queryClient.clear();
      toast.info('Logged out successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Logout failed');
    },
  });

  const value = {
    user: isError ? null : user,
    isAuthenticated: Boolean(user),
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
