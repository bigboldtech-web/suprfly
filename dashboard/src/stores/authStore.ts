import { create } from 'zustand';
import type { User, ConnectedAccount } from '@/types';

interface AuthState {
  user: User | null;
  accounts: ConnectedAccount[];
  selectedWorkflowId: string | null;
  setUser: (user: User | null) => void;
  setAccounts: (accounts: ConnectedAccount[]) => void;
  setSelectedWorkflowId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accounts: [],
  selectedWorkflowId: null,
  setUser: (user) => set({ user }),
  setAccounts: (accounts) => set({ accounts }),
  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),
}));
