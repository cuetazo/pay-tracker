import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import TransactionsScreen from './transactions';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/stores/supabase';
import { useModal } from '@/hooks/useModal';
import { Alert } from 'react-native';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/hooks/useModal', () => ({
  useModal: jest.fn(() => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  })),
}));

describe('TransactionsScreen', () => {
  const mockOpenModal = jest.fn();
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: 'user-uuid-123' },
    });

    (useModal as jest.Mock).mockReturnValue({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      let mockData: any = { data: [], error: null };
      
      if (table === 'transactions') {
        mockData = {
          data: [
            { id: 'tx-1', amount: 50, type: 'expense', label: 'Cine', destinatary: 'Cineplanet', created_at: '2026-07-10T12:00:00Z' },
            { id: 'tx-2', amount: 200, type: 'income', label: 'Consultoria', destinatary: 'Cliente A', created_at: '2026-07-09T12:00:00Z' },
          ],
          error: null,
        };
      } else if (table === 'category') {
        mockData = {
          data: [
            { id: 'cat-1', name: 'Entretenimiento', icon: 'gamepad-variant', color: '#ff0000' },
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

  it('renders transactions list correctly', async () => {
    const { getByText } = await render(<TransactionsScreen />);

    await waitFor(() => {
      expect(getByText('Cineplanet')).toBeTruthy();
      expect(getByText('Cliente A')).toBeTruthy();
    });
  });

  it('opens create transaction modal when add button is clicked', async () => {
    const { getByTestId } = await render(<TransactionsScreen />);

    await waitFor(async () => {
      const addBtn = getByTestId('add-transaction-button');
      await fireEvent.press(addBtn);
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });

  it('filters transactions correctly based on search query', async () => {
    const { getByPlaceholderText, queryByText, getByText } = await render(<TransactionsScreen />);

    await waitFor(() => {
      expect(getByText('Cineplanet')).toBeTruthy();
      expect(getByText('Cliente A')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Buscar por destinatario, categoría o tipo...');
    await fireEvent.changeText(searchInput, 'Cineplanet');

    expect(queryByText('Cineplanet')).toBeTruthy();
    expect(queryByText('Cliente A')).toBeNull();
  });
});
