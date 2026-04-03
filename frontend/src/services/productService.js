import api from '../api/axios';

// get products from the api
export const getProducts = (categoryId = null) => {
  // handle category filter if it exists
  const url = `/products${categoryId ? `?categoryId=${categoryId}` : ''}`;
  return api.get(url);
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const productService = {
  getProducts,
  getProductById
};

export default productService;
