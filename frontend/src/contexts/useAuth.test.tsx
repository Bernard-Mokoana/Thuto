import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AuthContext, type AuthContextType } from './auth-context';
import { useAuth } from './useAuth';
import type { ReactNode } from 'react';

const mockAuthValue: AuthContextType = {
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  refreshUser: async () => null,
  logout: () => {},
  isAuthenticated: false,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={mockAuthValue}>{children}</AuthContext.Provider>
);

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('returns context value when used inside AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toBe(mockAuthValue);
  });

  it('exposes user as null when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('exposes loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(false);
  });

  it('exposes login, register, refreshUser, logout functions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.refreshUser).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});

describe('AuthContext', () => {
  it('is created with undefined as default value', () => {
    // createContext<AuthContextType | undefined>(undefined) — default is undefined
    // Accessing context outside a provider should give undefined
    const { result } = renderHook(() => {
      const { useContext } = require('react') as typeof import('react');
      return useContext(AuthContext);
    });
    expect(result.current).toBeUndefined();
  });
});