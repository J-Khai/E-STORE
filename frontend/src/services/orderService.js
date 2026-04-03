import api from '../api/axios';

export const getMyOrders = () => {
    return api.get('/orders/my');
};

export const orderService = {
    getMyOrders
};

export default orderService;
