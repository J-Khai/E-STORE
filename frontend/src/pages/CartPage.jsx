import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
    const tax = subtotal * 0.15;
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-12 py-32 flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl font-bold tracking-tighter uppercase mb-6 text-zinc-950">Empty Cart</h1>
                <p className="text-[10px] font-bold text-zinc-950/30 uppercase tracking-[0.2em] mb-12">No items in your cart</p>
                <Link to="/products" className="btn-primary px-12">Back to Catalog</Link>
            </div>
        );
    }

    return (
        <div className="page-container py-20 lg:py-32">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-16 leading-none">
                Shopping Cart
            </h1>

            <div className="flex flex-col lg:flex-row gap-20">
                {/* cart items list */}
                <div className="flex-1 space-y-12">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-zinc-950 text-left">
                                    <th className="table-header">Product</th>
                                    <th className="table-header text-center">Amount</th>
                                    <th className="table-header text-right">Pricing</th>
                                    <th className="table-header"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-soft">
                                {cartItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-white transition-colors">
                                        <td className="py-8">
                                            <div className="flex items-center gap-6">
                                                <Link to={`/product/${item.productId || item.id}`} className="w-20 aspect-[4/5] bg-[#fafafa] border border-[#e2e8f0] overflow-hidden shrink-0 block">
                                                    <img src={item.imageUrl} alt={item.productName || item.name} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" />
                                                </Link>
                                                <div>
                                                    {/* product title */}
                                                    <Link to={`/product/${item.productId || item.id}`}>
                                                        <p className="text-xs font-bold text-zinc-950 uppercase tracking-tight hover:underline underline-offset-4">{item.productName || item.name}</p>
                                                    </Link>
                                                    <p className="label-mono lowercase">{item.categoryName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 text-center">
                                            <div className="inline-flex items-center gap-4 bg-zinc-50 border border-main px-3 py-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                                                    className="w-6 text-zinc-950 hover:font-black transition-all"
                                                >-</button>
                                                <span className="mono text-[10px] w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                                                    className="w-6 text-zinc-950 hover:font-black transition-all"
                                                >+</button>
                                            </div>
                                        </td>
                                        <td className="py-8 text-right table-cell">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                        <td className="py-8 text-right">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-[9px] font-bold uppercase tracking-widest text-zinc-950/20 hover:text-red-500 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* checkout summary */}
                <div className="w-full lg:w-96 shrink-0 h-max sticky top-32">
                    <div className="card-white">
                        <h2 className="label-mono mb-12 text-zinc-950/30">Checkout Summary</h2>

                        <div className="space-y-6 pb-10 divider-soft">
                            <div className="summary-row">
                                <span className="label-mono lowercase">Sub Total</span>
                                <span className="text-xs font-bold text-zinc-950">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="label-mono lowercase">Shipping</span>
                                <span className="text-xs font-bold text-zinc-950">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label-mono lowercase">Tax (13%)</span>
                                <span className="text-xs font-bold text-zinc-950">${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline py-10 mb-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950">Grand Total</span>
                            <span className="text-xl font-bold text-zinc-950 tracking-tighter">${total.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary w-full py-6"
                        >
                            Confirm Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
