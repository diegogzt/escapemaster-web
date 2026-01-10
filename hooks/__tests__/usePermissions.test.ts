import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { auth } from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock auth service
vi.mock('../../services/api', () => ({
  auth: {
    me: vi.fn(),
  },
}));

// Mock SecureStore
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SecureStore.getItemAsync as any).mockResolvedValue('fake-token');
  });

  it('should return loading initially', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.loading).toBe(true);
  });

  it('should load permissions successfully', async () => {
    const mockUser = {
      id: '1',
      role: {
        name: 'admin',
        permissions: [
          { permission_key: 'manage_bookings' },
          { permission_key: 'view_stats' },
        ],
      },
    };
    (auth.me as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissions).toEqual(['manage_bookings', 'view_stats']);
    expect(result.current.hasPermission('manage_bookings')).toBe(true);
    expect(result.current.hasPermission('delete_users')).toBe(false);
  });

  it('should handle error when loading permissions', async () => {
    (auth.me as any).mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.permissions).toEqual([]);
  });
});
