import api from '@/lib/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    avatar: {
      high: string;
      medium: string;
      low: string;
    }
  },
  tokens: {
    refresh: string;
    access: string;
  };
}

export const authService = {
  async login(loginData: LoginData): Promise<LoginResponse> {
    const response = await api.post('/auth/login/', loginData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
};