import { authService } from '@/services/authService';
import api from '@/lib/api';

jest.mock('@/lib/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        data: {
          tokens: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
          user: {
            id: 1,
            avatar: {
              high: 'avatar-high.jpg',
              medium: 'avatar-medium.jpg',
              low: 'avatar-low.jpg',
            },
          },
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const loginData = { email: 'test@test.com', password: 'password' };
      const result = await authService.login(loginData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login/', loginData);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token');
    });

    it('should throw error on login failure', async () => {
      const error = new Error('Login failed');
      mockApi.post.mockRejectedValue(error);

      await expect(authService.login({
        email: 'test@test.com',
        password: 'wrong-password',
      })).rejects.toThrow('Login failed');
    });
  });

  describe('logout', () => {
    it('should remove tokens from localStorage', () => {
      // Configurar estado inicial
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh-token');

      authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      // Configurar o mock para retornar um token
      localStorage.setItem('access_token', 'test-token');
      
      expect(authService.isAuthenticated()).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
    });

    it('should return false when access token does not exist', () => {
      // Garantir que não há token
      localStorage.removeItem('access_token');
      
      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockProfile = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        avatar: {
          high: 'avatar-high.jpg',
        },
      };

      mockApi.get.mockResolvedValue({ data: mockProfile });

      const result = await authService.getProfile();

      expect(mockApi.get).toHaveBeenCalledWith('/auth/profile/');
      expect(result).toEqual(mockProfile);
    });
  });
});