import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';
import { authService } from '../services/authService';
import { toast } from 'sonner';

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

const mockProfileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: {
    high: 'avatar-high.jpg',
    medium: 'avatar-medium.jpg',
    low: 'avatar-low.jpg',
  },
};

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );
};

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to login if not authenticated', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);

    renderProfile();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should load and display user profile data', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getProfile as jest.Mock).mockResolvedValue(mockProfileData);

    renderProfile();

    // Verifica loading state
    expect(screen.queryByText('Profile picture')).not.toBeInTheDocument();

    // Aguarda os dados carregarem
    expect(await screen.findByText('Profile picture')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
  });

  it('should show logout button and handle logout', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getProfile as jest.Mock).mockResolvedValue(mockProfileData);

    renderProfile();

    await screen.findByText('Profile picture');

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);

    expect(authService.logout).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Você desconectou-se da sua conta.');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle profile loading error with 403 status', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getProfile as jest.Mock).mockRejectedValue({
      response: {
        status: 403,
        detail: 'Token inválido',
      },
    });

    renderProfile();

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
    });

    expect(toast).toHaveBeenCalledWith('Token inválido');
  });

  it('should handle general profile loading error', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderProfile();

    // Apenas verifica que não quebra o componente
    await waitFor(() => {
      expect(screen.queryByText('Profile picture')).not.toBeInTheDocument();
    });
  });

  it('should display disabled inputs for user data', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getProfile as jest.Mock).mockResolvedValue(mockProfileData);

    renderProfile();

    await screen.findByText('Profile picture');

    const nameInput = screen.getByDisplayValue('John Doe');
    const emailInput = screen.getByDisplayValue('john.doe@example.com');

    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(nameInput).toHaveClass('bg-gray-200');
    expect(emailInput).toHaveClass('bg-gray-200');
  });
});