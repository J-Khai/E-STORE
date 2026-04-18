import api from '../api/axios';

export const getUsers = () => {
    return api.get('/users');
};

export const getProfile = () => {
    return api.get('/users/profile');
};

export const updateProfile = (profileData) => {
    return api.put('/users/profile', profileData);
};

export const addPaymentMethod = (cardData) => {
    return api.post('/users/profile/payment', cardData);
};

export const removePaymentMethod = (id) => {
    return api.delete(`/users/profile/payment/${id}`);
};

export const adminUpdateUser = (id, userData) => {
    return api.put(`/admin/users/${id}`, userData);
};

export const adminDeleteUser = (id) => {
    return api.delete(`/admin/users/${id}`);
};

export const userService = {
    getUsers,
    getProfile,
    updateProfile,
    addPaymentMethod,
    removePaymentMethod,
    adminUpdateUser,
    adminDeleteUser
};

export default userService;
