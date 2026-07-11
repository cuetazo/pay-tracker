import React from 'react';
import { render } from '@testing-library/react-native';
import RegisterScreen from './register';

describe('RegisterScreen', () => {
  it('renders register screen correctly', async () => {
    const { getByText } = await render(<RegisterScreen />);
    expect(getByText('Registro')).toBeTruthy();
  });
});
