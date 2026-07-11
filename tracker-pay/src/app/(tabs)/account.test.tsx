import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountScreen from './account';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { supabase } from '@/stores/supabase';
import { Alert } from 'react-native';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/themeStore', () => ({
  useThemeStore: jest.fn(),
}));

describe('AccountScreen', () => {
  const mockSignOut = jest.fn();
  const mockSetDarkMode = jest.fn();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: 'user-uuid-123', name: 'John Doe', email: 'john@example.com' },
      SignOut: mockSignOut,
    });

    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      isDarkMode: false,
      setDarkMode: mockSetDarkMode,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: mockEq,
      update: mockUpdate,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('renders profile data correctly', async () => {
    mockSingle.mockResolvedValue({
      data: {
        monthly_spending_limit: 1200,
        monthly_income: 3000,
      },
      error: null,
    });

    const { getByText } = await render(<AccountScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
      expect(getByText('S/ 3,000.00')).toBeTruthy(); // Monthly income
      expect(getByText('S/ 1,200.00')).toBeTruthy(); // Spending limit
    });
  });

  it('calls SignOut when Log Out button is pressed', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    const { getByText } = await render(<AccountScreen />);

    const logOutBtn = getByText(/cerrar sesión/i);
    await fireEvent.press(logOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
