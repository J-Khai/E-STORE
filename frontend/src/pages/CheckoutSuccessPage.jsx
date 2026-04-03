import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

const CheckoutSuccessPage = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const total = location.state?.total;

    // Guard: Prevent direct access to success page with no order info
    if (!orderId) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="max-w-[1440px] mx-auto px-12 py-32 flex flex-col items-center justify-center min-h-[70vh] text-center">
            {/* checkmark */}
            <div className="w-24 h-24 border-2 border-zinc-950 flex items-center justify-center mb-12 animate-in slide-in-top-8 duration-1000">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-zinc-950 fill-none stroke-zinc-950 stroke-[3]">
                   <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <h1 className="text-5xl font-bold tracking-tighter uppercase mb-6 text-zinc-950">Order Confirmed</h1>
            <p className="text-[12px] font-bold text-zinc-950/30 uppercase tracking-[0.3em] mb-16">Your order has been successfully placed and is being processed</p>

            <div className="w-full max-w-sm space-y-8 card-white mb-20 text-left">
                <h2 className="label-mono mb-8 opacity-30 text-[10px] uppercase font-bold tracking-widest">Order Summary</h2>
                
                <div className="space-y-4 pb-8 divider-soft">
                    <div className="summary-row">
                        <span className="label-mono text-[9px] uppercase font-bold tracking-widest opacity-40">Order ID</span>
                        <span className="mono text-xs font-bold text-zinc-950 tracking-widest uppercase">#{orderId.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="summary-row">
                        <span className="label-mono text-[9px] uppercase font-bold tracking-widest opacity-40">Status</span>
                        <span className="mono text-[9px] font-bold py-1 px-3 bg-green-50 text-green-700 border border-green-200 uppercase">Confirmed</span>
                    </div>
                </div>

                <div className="summary-row pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950">Total Amount</span>
                    <span className="text-xl font-bold text-zinc-950 tracking-tighter">${total?.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/products" className="btn-primary px-16 py-6">Continue Shopping</Link>
                <Link to="/profile/history" className="btn-outline px-16 py-6 border-zinc-950 hover:bg-zinc-950 hover:text-white transition-all duration-300">View Orders</Link>
            </div>

            <p className="mt-20 label-mono text-[9px] opacity-20 max-w-md uppercase leading-relaxed font-bold tracking-widest">
                A confirmation email has been sent to your primary contact address. You can track your shipment status through your account dashboard at any time.
            </p>
        </div>
    );
};

export default CheckoutSuccessPage;
