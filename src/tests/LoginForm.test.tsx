import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../App';
import { authService } from '../services/authService';

// Mock das dependências
jest.mock('../services/authService');
jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form with default values', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

    // Verifica valores padrão
    const emailInput = screen.getByPlaceholderText('@gmail.com');
    expect(emailInput).toHaveValue('cliente@youdrive.com');
  });

  it('should show validation errors for invalid inputs', async () => {
    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Limpa os campos
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
    expect(await screen.findByText(/a senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
  });

  it('should login successfully with valid credentials', async () => {
    const mockLoginResponse = {
      tokens: {
        access: 'access-token',
        refresh: 'refresh-token',
      },
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
      },
    };

    (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'cliente@youdrive.com',
        password: 'password',
      });
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should show error message when login fails', async () => {
    const errorMessage = 'Credenciais inválidas';
    (authService.login as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should disable form elements during loading', async () => {
    (authService.login as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });

    expect(submitButton).toHaveTextContent('Entrando...');
  });
});