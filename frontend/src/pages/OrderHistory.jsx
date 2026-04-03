import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../services/orderService';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getMyOrders();
                setOrders(res.data);
            } catch (err) {
                console.error("Order history retrieval failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] mono text-[10px] uppercase tracking-widest animate-pulse">
            Loading your orders...
        </div>
    );

    return (
        <div className="page-container py-20 lg:py-32">
            <header className="mb-20">
                <nav className="mb-8">
                    <Link to="/profile" className="label-mono hover:text-zinc-950 transition-colors">Profile</Link>
                    <span className="mx-4 text-zinc-950/20">/</span>
                    <span className="label-mono text-zinc-950">History</span>
                </nav>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-zinc-950 mb-4">
                    Order History
                </h1>
                <p className="label-mono uppercase opacity-30">View your previous orders and shipment status</p>
            </header>

            {orders.length === 0 ? (
                <div className="py-20 text-center border-t border-zinc-100">
                    <p className="label-mono uppercase opacity-40 mb-8">No previous orders found.</p>
                    <Link to="/products" className="btn-primary px-12">Start Shopping</Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-950">
                                <th className="py-6 label-mono text-[10px] uppercase opacity-40">Date</th>
                                <th className="py-6 label-mono text-[10px] uppercase opacity-40">Order ID</th>
                                <th className="py-6 label-mono text-[10px] uppercase opacity-40 text-right">Total Price</th>
                                <th className="py-6 label-mono text-[10px] uppercase opacity-40 text-center">Status</th>
                                <th className="py-6 label-mono text-[10px] uppercase opacity-40 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group">
                                    <td className="py-8 text-[11px] font-bold uppercase tracking-tight">
                                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="py-8 font-mono text-[10px] opacity-60">
                                        #{order.id.toString().padStart(6, '0')}
                                    </td>
                                    <td className="py-8 text-sm font-bold text-zinc-950 tracking-tighter text-right">
                                        ${order.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="py-8 text-center">
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                                            order.status === 'PROCESSED' 
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                                : ['PAID', 'APPROVED', 'SHIPPED'].includes(order.status)
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-8 text-right">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="label-mono text-[10px] uppercase font-bold hover:underline underline-offset-4"
                                        >
                                            View Details &rarr;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for details */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 lg:p-20">
                    <div className="w-full max-w-2xl bg-white border border-zinc-950 shadow-2xl p-12 lg:p-20 relative animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-8 right-8 text-zinc-300 hover:text-zinc-950 transition-colors text-2xl font-light"
                        >
                            &times;
                        </button>
                        
                        <header className="mb-12">
                            <p className="label-mono text-[10px] uppercase opacity-30 mb-2">Order Details</p>
                            <h3 className="text-3xl font-bold tracking-tighter uppercase text-zinc-950">
                                Order #{selectedOrder.id.toString().padStart(6, '0')}
                            </h3>
                        </header>

                        <div className="space-y-4 mb-20 overflow-y-auto max-h-[40vh] pr-4">
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-baseline py-4 border-b border-zinc-100 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-950">
                                            {item.quantity}x {item.productName}
                                        </span>
                                        <span className="label-mono text-[9px] uppercase opacity-40">{item.productBrand}</span>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-950 tracking-tighter">
                                        ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <footer className="pt-10 border-t-4 border-zinc-950 flex justify-between items-baseline">
                            <span className="label-mono text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-950/40">Total Price</span>
                            <span className="text-4xl font-bold text-zinc-950 tracking-tighter">
                                ${selectedOrder.totalAmount.toFixed(2)}
                            </span>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
