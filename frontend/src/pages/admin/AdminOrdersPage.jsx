import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PERIOD_OPTIONS = [
    { value: 'ALL', label: 'All Time' },
    { value: '1Y',  label: '1 Year' },
    { value: '6M',  label: '6 Months' },
    { value: '30D', label: '30 Days' },
    { value: '2W',  label: '2 Weeks' },
];

const getWindowStart = (period) => {
    const now = new Date();
    switch (period) {
        case '2W':  return new Date(now - 14 * 864e5);
        case '30D': return new Date(now - 30 * 864e5);
        case '6M':  return new Date(now.setMonth(now.getMonth() - 6));
        case '1Y':  return new Date(now.setFullYear(now.getFullYear() - 1));
        default:    return null; // ALL
    }
};

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('2W');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                const res = await axios.get('/admin/orders');
                const incomingData = res.data;

                if (Array.isArray(incomingData)) {
                    setOrders(incomingData);
                } else if (incomingData && Array.isArray(incomingData.orders)) {
                    setOrders(incomingData.orders);
                    if (incomingData.totalRevenue) setRevenue(incomingData.totalRevenue);
                } else if (incomingData && Array.isArray(incomingData.content)) {
                    setOrders(incomingData.content);
                } else {
                    setOrders([]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Orders sync failure", err);
                toast.error("Failed to fetch order history.");
                setLoading(false);
                setOrders([]);
            }
        };
        fetchAllOrders();
    }, []);

    const allOrders = Array.isArray(orders) ? orders : [];

    const windowStart = getWindowStart(period);
    const windowFiltered = windowStart
        ? allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= windowStart)
        : allOrders;

    const activeOrders = statusFilter === 'ALL'
        ? windowFiltered
        : windowFiltered.filter(o => o.status === statusFilter);

    const displayedRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const handleApprove = async (id) => {
        try {
            const res = await axios.patch(`/admin/orders/${id}/approve`);
            setOrders(prev => prev.map(o => o.id === id ? res.data : o));
            toast.success("Order approved.");
        } catch (err) {
            console.error("Approval failure", err);
            toast.error("Failed to approve transaction.");
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await axios.patch(`/admin/orders/${id}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === id ? res.data : o));
            toast.success(`Order set to ${newStatus}`);
        } catch (err) {
            console.error("Status update failure", err);
            toast.error("Failed to update status.");
        }
    };

    return (
        <div className="space-y-12">
            <header className="divider-soft pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="label-mono mb-4 text-zinc-950/30 uppercase">Order Registry</h2>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase text-zinc-950 underline decoration-zinc-950 decoration-4 underline-offset-8">
                        Order Log
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="label-mono text-[9px] uppercase opacity-40 mb-1">Total Revenue</span>
                        <span className="text-2xl font-bold text-zinc-950 tracking-tighter mono">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayedRevenue)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase text-zinc-400">Time Window</span>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-white border border-[#e2e8f0] px-3 py-2 text-[10px] font-bold uppercase tracking-wider outline-none"
                        >
                            {PERIOD_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* status filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
                {['ALL', 'PAID', 'PROCESSED', 'SHIPPED', 'REJECTED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 border transition-all ${
                            statusFilter === s
                                ? 'bg-zinc-950 text-white border-zinc-950'
                                : 'bg-white text-zinc-950/40 border-[#e2e8f0] hover:text-zinc-950 hover:border-zinc-950'
                        }`}
                    >
                        {s === 'ALL' ? 'All Statuses' : s}
                        {s !== 'ALL' && (
                            <span className="ml-2 opacity-60">
                                ({windowFiltered.filter(o => o.status === s).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="mono text-[10px] uppercase tracking-widest animate-pulse font-bold text-zinc-950/40 py-12">
                    Loading Orders...
                </div>
            ) : activeOrders.length === 0 ? (
                <div className="placeholder-card py-32 bg-white">
                    <p className="text-[10px] font-black uppercase text-zinc-950/20 tracking-widest">
                        No orders found
                    </p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <div className="max-h-[600px] overflow-y-auto relative">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-white z-20 shadow-sm">
                                <tr className="border-b-2 border-zinc-950 text-left">
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 pl-6">Timestamp</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 px-4">ID</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40">Buyer</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 text-right">Revenue</th>
                                    <th className="py-4 text-[9px] font-black uppercase tracking-widest text-zinc-950/40 text-right pr-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-soft">
                                {activeOrders.map(o => (
                                    <tr key={o.id} className="group hover:bg-zinc-50 transition-colors">
                                        <td className="py-5 pl-6 text-xs font-mono text-zinc-950/60 lowercase">
                                            {o.createdAt ? format(new Date(o.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="text-xs font-bold text-zinc-950 tracking-tighter">#{o.id}</span>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-950">{o.user?.firstName} {o.user?.lastName}</span>
                                                <span className="label-mono text-[9px] lowercase opacity-40">{o.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-right text-xs font-bold text-zinc-950">${o.totalAmount?.toFixed(2)}</td>
                                        <td className="py-5 text-right pr-6">
                                            <div className="flex items-center gap-6">
                                                <span className={`status-badge 
                                                    ${o.status === 'PAID' || o.status === 'APPROVED' ? 'status-badge-success' : 
                                                      o.status === 'PROCESSED' ? 'status-badge-info' :
                                                      o.status === 'SHIPPED' ? 'status-badge-success' :
                                                      'status-badge-error'}`}>
                                                    {o.status}
                                                </span>
                                                <div className="flex gap-4">
                                                    {o.status === 'REJECTED' && (
                                                        <button 
                                                            onClick={() => handleApprove(o.id)}
                                                            className="text-[8px] font-bold uppercase tracking-widest text-zinc-950 underline hover:text-green-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {(o.status === 'PAID' || o.status === 'APPROVED') && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(o.id, 'PROCESSED')}
                                                                className="text-[8px] font-bold uppercase tracking-widest text-blue-600 underline hover:text-blue-800 transition-colors"
                                                            >
                                                                Process
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(o.id, 'REJECTED')}
                                                                className="text-[8px] font-bold uppercase tracking-widest text-red-600 underline hover:text-red-800 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {o.status === 'PROCESSED' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(o.id, 'SHIPPED')}
                                                                className="text-[8px] font-bold uppercase tracking-widest text-green-600 underline hover:text-green-800 transition-colors"
                                                            >
                                                                Ship
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(o.id, 'REJECTED')}
                                                                className="text-[8px] font-bold uppercase tracking-widest text-red-600 underline hover:text-red-800 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
