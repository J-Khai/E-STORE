import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CheckoutErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-[1440px] mx-auto px-12 py-32 flex flex-col items-center justify-center min-h-[70vh] text-center">
            {/* Minimalist Error Mark */}
            <div className="w-24 h-24 border-2 border-red-500 flex items-center justify-center mb-12 animate-pulse">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-red-500 fill-none stroke-red-500 stroke-[3]">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </div>

            <h1 className="text-5xl font-bold tracking-tighter uppercase mb-6 text-red-500">Authorization Failed</h1>
            <p className="text-[12px] font-bold text-zinc-950/30 uppercase tracking-[0.3em] mb-16 max-w-lg mx-auto">
                The transaction could not be validated by our credit protocols. Please verify your finance credentials.
            </p>

            <div className="w-full max-w-sm space-y-8 bg-red-50 border border-red-100 p-12 mb-20 text-center">
                <h2 className="label-mono mb-4 text-red-400">Potential Discrepancies</h2>
                <ul className="text-left space-y-4 text-red-800 label-mono lowercase opacity-50 font-bold">
                    <li>- Invalid sequence detected</li>
                    <li>- Expiry date outside valid window</li>
                    <li>- Insufficient credentials matching</li>
                    <li>- CVV code verification failure</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
                <button
                    onClick={() => navigate('/checkout')}
                    className="btn-primary bg-red-500 border-red-500 px-16 py-6"
                >
                    Retry Verification
                </button>
                <Link to="/cart" className="btn-outline border-zinc-200 px-16 py-6">Modify Cart Selection</Link>
            </div>

            <p className="mt-20 label-mono text-[9px] opacity-20 max-w-md uppercase leading-relaxed font-bold">
                If the error persists through multiple attempts, please contact our registry support center at +0-123-STORE-456-789.
            </p>
        </div>
    );
};

export default CheckoutErrorPage;
