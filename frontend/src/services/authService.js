import api from '../api/axios';

// login post 
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// register post
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const authService = {
  login,
  register,
};

export default authService;
