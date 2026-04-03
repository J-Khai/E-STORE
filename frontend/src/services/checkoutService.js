import api from '../api/axios';

export const processPayment = (checkoutData, items) => {
    return api.post('/checkout', {
        ...checkoutData,
        items: items.map(item => ({
            productId: item.productId || item.id,
            quantity: item.quantity
        }))
    });
};

export const checkoutService = {
    processPayment
};

export default checkoutService;
