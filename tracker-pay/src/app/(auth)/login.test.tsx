import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from './login';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login screen correctly when user is not logged in', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      SignIn: mockSignIn,
      SignOut: mockSignOut,
    });

    const { getByText } = await render(<LoginScreen />);
    
    expect(getByText('Tracker Pay')).toBeTruthy();
    expect(getByText('Finanzas precisas para tu vida diaria. Controla tus gastos, ahorra de forma simple.')).toBeTruthy();
    expect(getByText('Continuar con Google')).toBeTruthy();
  });

  it('calls SignIn when button is pressed and user is not logged in', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      SignIn: mockSignIn,
      SignOut: mockSignOut,
    });

    const { getByText } = await render(<LoginScreen />);
    const button = getByText('Continuar con Google');
    
    await fireEvent.press(button);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('calls SignOut when button is pressed and user is logged in', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: '123', name: 'John Doe' },
      SignIn: mockSignIn,
      SignOut: mockSignOut,
    });

    const { getByText } = await render(<LoginScreen />);
    const button = getByText('Continuar con Google');
    
    await fireEvent.press(button);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
