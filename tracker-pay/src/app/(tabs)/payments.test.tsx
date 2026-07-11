import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import PaymentsScreen from './payments';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/stores/supabase';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

describe('PaymentsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: 'user-uuid-123' },
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      let mockData: any = { data: [], error: null };
      
      if (table === 'transactions') {
        const mockCreatedDate = new Date().toISOString(); // Current month to match stats calculation
        mockData = {
          data: [
            { id: 'tx-1', amount: 50, type: 'expense', categoryId: 'cat-1', destinatary: 'Luz del Sur', created_at: mockCreatedDate },
            { id: 'tx-2', amount: 150, type: 'expense', categoryId: 'cat-2', destinatary: 'Netflix', created_at: mockCreatedDate },
          ],
          error: null,
        };
      } else if (table === 'category') {
        mockData = {
          data: [
            { id: 'cat-1', name: 'Servicios', icon: 'lightning-bolt', color: '#ff0000' },
            { id: 'cat-2', name: 'Entretenimiento', icon: 'gamepad-variant', color: '#0000ff' },
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

  it('renders payments list and calculates statistics correctly', async () => {
    const { getByText } = await render(<PaymentsScreen />);

    await waitFor(() => {
      // Check statistics rendering
      // Total Paid: 50 + 150 = 200
      expect(getByText('S/ 200.00')).toBeTruthy();
      // Average: 200 / 2 = 100
      expect(getByText('S/ 100.00')).toBeTruthy();
      // Transactions count: 2
      expect(getByText(/2\s+trans\./i)).toBeTruthy();

      // Check rendered transactions
      expect(getByText('Luz del Sur')).toBeTruthy();
      expect(getByText('Netflix')).toBeTruthy();
    });
  });

  it('filters payments correctly on search input', async () => {
    const { getByPlaceholderText, queryByText, getByText } = await render(<PaymentsScreen />);

    await waitFor(() => {
      expect(getByText('Luz del Sur')).toBeTruthy();
      expect(getByText('Netflix')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Buscar por destinatario o categoría...');
    await fireEvent.changeText(searchInput, 'Netflix');

    // Should only show Netflix
    expect(queryByText('Netflix')).toBeTruthy();
    expect(queryByText('Luz del Sur')).toBeNull();
  });
});
