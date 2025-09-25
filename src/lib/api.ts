import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'https://api.homologation.cliqdrive.com.br',
  headers: {
    'Accept': 'application/json;version=v1_web',
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token de acesso às requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;