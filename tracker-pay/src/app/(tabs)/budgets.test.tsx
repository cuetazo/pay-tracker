import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import BudgetsScreen from './budgets';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/stores/supabase';
import { useModal } from '@/hooks/useModal';
import { Alert } from 'react-native';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/hooks/useModal', () => ({
  useModal: jest.fn(),
}));

describe('BudgetsScreen', () => {
  const mockOpenModal = jest.fn();
  const mockDelete = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: 'user-uuid-123' },
    });

    (useModal as jest.Mock).mockReturnValue({
      openModal: mockOpenModal,
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      let mockData: any = { data: [], error: null };
      
      if (table === 'category') {
        mockData = {
          data: [
            { id: 'cat-1', name: 'Comida', limit_amount: 500, limit_interval: 'monthly', color: '#ff0000', icon: 'food' },
            { id: 'cat-2', name: 'Transporte', limit_amount: 200, limit_interval: 'monthly', color: '#0000ff', icon: 'car' },
          ],
          error: null,
        };
      } else if (table === 'transactions') {
        mockData = {
          data: [
            { id: 'tx-1', amount: 150, type: 'expense', categoryId: 'cat-1' },
            { id: 'tx-2', amount: 50, type: 'expense', categoryId: 'cat-1' },
            { id: 'tx-3', amount: 80, type: 'expense', categoryId: 'cat-2' },
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
        delete: mockDelete,
        then: jest.fn((onFulfilled) => Promise.resolve(mockData).then(onFulfilled)),
      };
      
      return queryChain;
    });

    mockDelete.mockReturnValue({
      eq: mockEq,
    });
  });

  it('renders budgets and category spent details correctly', async () => {
    const { getByText, getAllByText } = await render(<BudgetsScreen />);

    await waitFor(() => {
      // Total Spent = (150+50) + 80 = 280
      expect(getByText('S/ 280.00')).toBeTruthy();

      // Individual categories
      expect(getByText('Comida')).toBeTruthy();
      
      // S/ 200.00 is rendered both as spent for Comida and limit for Transporte
      const elements200 = getAllByText('S/ 200.00');
      expect(elements200.length).toBe(2);

      expect(getByText('S/ 500.00')).toBeTruthy(); // Comida limit

      expect(getByText('Transporte')).toBeTruthy();
      expect(getByText('S/ 80.00')).toBeTruthy(); // Transporte spent
    });
  });

  it('triggers category creation modal when add button is clicked', async () => {
    const { getByTestId } = await render(<BudgetsScreen />);

    await waitFor(async () => {
      const addBtn = getByTestId('add-category-button');
      await fireEvent.press(addBtn);
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });
});
