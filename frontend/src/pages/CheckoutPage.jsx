import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { processPayment } from '../services/checkoutService';
import { getProfile } from '../services/userService';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [processing, setProcessing] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('NEW');

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        address: '',
        city: '',
        state: '',
        zip: '',
        cardNumber: '',
        cvv: '',
        expiry: '',
        saveCard: false
    });

    useEffect(() => {
        if (isAuthenticated) {
            getProfile()
                .then(res => {
                    setSavedMethods(res.data.paymentMethods || []);
                    if (res.data.address) {
                        setFormData(prev => ({
                            ...prev,
                            fullName: res.data.firstName + ' ' + res.data.lastName,
                            address: res.data.address.street,
                            city: res.data.address.city,
                            state: res.data.address.state,
                            zip: res.data.address.zip
                        }));
                    }
                })
                .catch(err => console.error("Identity fetch failed", err));
        }
    }, [isAuthenticated]);

    const subtotal = getCartTotal();
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.13;
    const total = subtotal + shipping + tax;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setFieldErrors({});

        const checkoutPayload = { ...formData };
        if (selectedMethod !== 'NEW') {
            checkoutPayload.paymentToken = selectedMethod;
            delete checkoutPayload.cardNumber;
        }

        try {
            const response = await processPayment(checkoutPayload, cartItems);
            const data = response.data;

            if (data.status === 'PAID') {
                toast.success('Payment Successful');
                clearCart();
                navigate('/checkout/success', { state: { orderId: data.orderId, total } });
                return;
            } 
            
            if (data.status === 'PAYMENT_FAILED') {
                setFieldErrors({ cardNumber: true });
            } else {
                toast.error(data.message || 'Transaction could not be processed.');
            }
        } catch (err) {
            console.error("Payment Error:", err);
            const errorMsg = err.response?.data?.message || 'Payment processing failed.';
            toast.error(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-xl mx-auto py-32 text-center text-zinc-950">
                <h2 className="text-2xl font-bold uppercase mb-8">Cart is Empty</h2>
                <Link to="/products" className="btn-primary px-12">Return to Shop</Link>
            </div>
        );
    }

    return (
        <div className="page-container py-20 lg:py-32">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-16 underline decoration-4 underline-offset-8">
                Confirm Order
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                    {/* Shipping Section */}
                    <section>
                        <h2 className="label-mono mb-8 text-zinc-950/30 uppercase">Shipping Address</h2>
                        <div className="space-y-6">
                            <input 
                                required name="fullName" 
                                placeholder="Full Name"
                                value={formData.fullName} 
                                onChange={handleInputChange}
                                className="input-field w-full"
                            />
                            
                            <input 
                                required name="address" 
                                placeholder="Street Address"
                                value={formData.address} 
                                onChange={handleInputChange}
                                className="input-field w-full"
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <input 
                                    required name="city" 
                                    placeholder="City"
                                    value={formData.city} 
                                    onChange={handleInputChange}
                                    className="input-field w-full"
                                />
                                <input 
                                    required name="state" 
                                    placeholder="Province / State"
                                    value={formData.state} 
                                    onChange={handleInputChange}
                                    className="input-field w-full"
                                />
                            </div>
                            <input 
                                required name="zip" 
                                placeholder="Zip / Postal Code"
                                value={formData.zip} 
                                onChange={handleInputChange}
                                className="input-field w-full"
                            />
                        </div>
                    </section>

                    {/* Payment Section */}
                    <section>
                        <div className="summary-row mb-8">
                            <h2 className="label-mono text-zinc-950/30 uppercase">Payment Method</h2>
                            {savedMethods.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <span className="label-mono text-[9px] uppercase opacity-40">Saved Cards:</span>
                                    <select 
                                        value={selectedMethod}
                                        onChange={(e) => setSelectedMethod(e.target.value)}
                                        className="bg-transparent text-[10px] font-bold uppercase underline decoration-zinc-950 underline-offset-4 outline-none border-none cursor-pointer"
                                    >
                                        <option value="NEW">New Card</option>
                                        {savedMethods.map(m => (
                                            <option key={m.paymentToken} value={m.paymentToken}>
                                                **** {m.lastFourDigits}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {selectedMethod === 'NEW' ? (
                                <div className="relative">
                                    <input 
                                        required name="cardNumber" 
                                        placeholder="Card Number"
                                        maxLength="16"
                                        value={formData.cardNumber} 
                                        onChange={handleInputChange}
                                        className={`input-field w-full mono tracking-widest transition-all duration-300 ${fieldErrors.cardNumber ? 'border-red-500 bg-red-50/50' : ''}`}
                                    />
                                    {fieldErrors.cardNumber && (
                                        <p className="absolute -bottom-6 left-0 text-[9px] uppercase font-bold text-red-500 tracking-wider">Invalid Card Number</p>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full bg-zinc-50 border-main p-6 flex flex-col gap-2">
                                    <span className="label-mono text-[10px] uppercase text-zinc-950/40">Secure Token Authentication</span>
                                    <span className="text-sm font-bold text-zinc-950 uppercase">Using Saved Payment Method</span>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-6">
                                <input 
                                    required name="expiry" 
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    disabled={selectedMethod !== 'NEW'}
                                    value={formData.expiry} 
                                    onChange={handleInputChange}
                                    className={`input-field w-full ${selectedMethod !== 'NEW' ? 'opacity-30' : ''}`}
                                />
                                <input 
                                    required name="cvv" 
                                    type="password"
                                    placeholder="CVV"
                                    maxLength="3"
                                    value={formData.cvv} 
                                    onChange={handleInputChange}
                                    className="input-field w-full"
                                />
                            </div>

                            {selectedMethod === 'NEW' && isAuthenticated && (
                                <div className="flex items-center gap-4 pt-4">
                                    <input 
                                        type="checkbox" 
                                        name="saveCard"
                                        id="save-card-chk"
                                        checked={formData.saveCard}
                                        onChange={handleInputChange}
                                        className="accent-zinc-950"
                                    />
                                    <label htmlFor="save-card-chk" className="label-mono text-[10px] uppercase">Save this card for future purchases</label>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:sticky lg:top-32 h-max bg-white border-4 border-zinc-950 p-12">
                    <h2 className="label-mono mb-12 text-zinc-950/30 uppercase">Order Summary</h2>
                    <ul className="space-y-4 mb-10 pb-10 divider-soft">
                        {cartItems.map(item => (
                            <li key={item.id} className="summary-row text-[11px] uppercase font-bold tracking-tight">
                                <span>{item.quantity}x {(item.productName || item.name || 'Product').substring(0, 24)}...</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="space-y-4 mb-10">
                        <div className="summary-row">
                           <span className="label-mono lowercase text-zinc-950/40">Shipping</span>
                           <span className="font-bold text-zinc-950 text-[11px] uppercase">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row">
                           <span className="label-mono lowercase text-zinc-950/40">Estimated Tax</span>
                           <span className="font-bold text-zinc-950 text-[11px] uppercase">${tax.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="summary-row mb-12">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950">Total Amount</span>
                        <span className="text-3xl font-bold text-zinc-950 tracking-tighter underline decoration-zinc-950 decoration-4 underline-offset-8">${total.toFixed(2)}</span>
                    </div>

                    <button 
                        disabled={processing}
                        className={`btn-primary w-full py-6 flex items-center justify-center gap-4 ${processing ? 'opacity-50' : ''}`}
                    >
                        {processing ? (
                            <React.Fragment>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span className="tracking-widest uppercase">Processing Payment...</span>
                            </React.Fragment>
                        ) : (
                            'Confirm Payment'
                        )}
                    </button>
                    
                    <p className="mt-8 label-mono text-[9px] text-center opacity-40 leading-relaxed uppercase">
                        Secure SSL Encrypted Checkout
                    </p>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
