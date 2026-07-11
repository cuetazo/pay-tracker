import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingScreen from './on_boarding';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/stores/supabase';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('OnboardingScreen', () => {
  const mockReplace = jest.fn();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: 'user-uuid-123', name: 'Jane Doe' },
    });

    // Setup Supabase mock chain
    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
  });

  it('renders Step 1 correctly and handles validation', async () => {
    const { getByText } = await render(<OnboardingScreen />);
    
    expect(getByText(/¡hola, jane!/i)).toBeTruthy();
    expect(getByText('¿Cuánto ganas al mes?')).toBeTruthy();

    const continueBtn = getByText('Continuar');
    
    // Press continue without entering salary (should alert)
    await fireEvent.press(continueBtn);
    expect(Alert.alert).toHaveBeenCalledWith('Ingreso inválido', 'Por favor ingresa un salario válido.');
  });

  it('advances through steps 1, 2, and 3, and finishes successfully', async () => {
    const { getByPlaceholderText, getByText } = await render(<OnboardingScreen />);
    
    // Step 1: Input Salary
    const salaryInput = getByPlaceholderText('0.00');
    await fireEvent.changeText(salaryInput, '5000');
    
    const continueBtn = getByText('Continuar');
    await fireEvent.press(continueBtn);

    // Should now be on Step 2
    expect(getByText('Tu límite de gasto')).toBeTruthy();
    expect(getByText('Límite de gasto mensual')).toBeTruthy();

    // Step 2: Input Limit
    const limitInput = getByPlaceholderText('0.00');
    await fireEvent.changeText(limitInput, '4000');
    await fireEvent.press(getByText('Continuar'));

    // Should now be on Step 3
    expect(getByText('¡Todo listo!')).toBeTruthy();
    expect(getByText('S/ 5,000.00')).toBeTruthy(); // Income
    expect(getByText('S/ 4,000.00')).toBeTruthy(); // Spend Limit

    // Finish
    const finishBtn = getByText('Comenzar');
    await fireEvent.press(finishBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({
        monthly_income: 5000,
        monthly_spending_limit: 4000,
        salary: 5000,
        spending_limit: 4000,
        onboarding_completed: true,
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-uuid-123');
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
