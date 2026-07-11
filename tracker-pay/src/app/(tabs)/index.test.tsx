import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from './index';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { supabase } from '@/stores/supabase';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/themeStore', () => ({
  useThemeStore: jest.fn(),
}));

describe('HomeScreen (Dashboard)', () => {
  const mockSingle = jest.fn();
  const mockEq = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: 'user-uuid-123', name: 'John Doe' },
    });

    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      isDarkMode: false,
    });

    // Mock supabase calls
    (supabase.from as jest.Mock).mockImplementation((table) => {
      let mockData: any = { data: [], error: null };
      
      if (table === 'profiles') {
        mockData = {
          data: {
            monthly_income: 5000,
            monthly_spending_limit: 2000,
            current_month_spending: 500,
          },
          error: null,
        };
      } else if (table === 'transactions') {
        mockData = {
          data: [
            { id: 'tx-1', amount: 150, type: 'expense', label: 'Almuerzo', created_at: '2026-07-10T12:00:00Z' },
            { id: 'tx-2', amount: 1000, type: 'income', label: 'Sueldo Extra', created_at: '2026-07-09T12:00:00Z' },
          ],
          error: null,
        };
      } else if (table === 'category') {
        mockData = {
          data: [
            { id: 'cat-1', name: 'Comida', color: '#ff0000', icon: 'food' },
          ],
          error: null,
        };
      }

      const queryChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) => Promise.resolve(mockData).then(onFulfilled)),
      };
      
      return queryChain;
    });
  });

  it('renders loading state first, then fetches and renders dashboard data', async () => {
    const { getByText } = await render(<HomeScreen />);

    // Renders the total balance and limits correctly
    await waitFor(() => {
      // Salary 5000 + Income 1000 - Expense 150 = 5850 balance
      expect(getByText('S/ 5,850.00')).toBeTruthy();
      
      // Income and expenses boxes
      expect(getByText('S/ 1,000.00')).toBeTruthy();
      expect(getByText(/-S\/ 150.00/)).toBeTruthy();
      
      // Limit section
      expect(getByText('S/ 500.00')).toBeTruthy(); // Current spending
      expect(getByText('S/ 2,000.00')).toBeTruthy(); // Spending limit
    });
  });
});
