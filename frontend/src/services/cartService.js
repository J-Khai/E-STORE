import api from '../api/axios';

// cart api calls
export const getCart = () => api.get('/cart/items');

export const addItemToCart = (productId, quantity) => 
    api.post('/cart/items', { productId, quantity });

export const updateCartItem = (id, quantity) => 
    api.put(`/cart/items/${id}`, { quantity });

export const removeCartItem = (id) => 
    api.delete(`/cart/items/${id}`);

export const clearBackendCart = () => 
    api.delete('/cart/items');

export const cartService = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearBackendCart
};

export default cartService;
