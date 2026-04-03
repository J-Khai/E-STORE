import api from '../api/axios';

// get categories
export const getCategories = () => api.get('/categories');

export const categoryService = {
  getCategories,
};

export default categoryService;
