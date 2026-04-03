import React, { useEffect, useState } from 'react';
import SalesChart from '../../components/admin/SalesChart';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const PERIOD_OPTIONS = [
    { value: '2W',  label: '2 Weeks' },
    { value: '30D', label: '30 Days' },
    { value: '6M',  label: '6 Months' },
    { value: '1Y',  label: '1 Year' },
    { value: 'ALL', label: 'All Time' },
];

const AdminMetricsPage = () => {
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 });
    // controls the stats cards + PDF export
    const [statsPeriod, setStatsPeriod] = useState('30D');
    // controls only the chart
    const [chartPeriod, setChartPeriod] = useState('30D');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/admin/stats', {
                    params: { window: statsPeriod }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Stats sync failure", err);
            }
        };
        fetchStats();
    }, [statsPeriod]);

    const handleDownloadPdf = async () => {
        try {
            toast.loading(`Generating ${statsPeriod} report...`, { id: 'pdf-toast' });
            const response = await axios.get('/admin/reports/sales', {
                params: { window: statsPeriod },
                responseType: 'blob'
            });
            
            const blobUrl = globalThis.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `sales-report-${statsPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success("Sales report downloaded.", { id: 'pdf-toast' });
        } catch (err) {
            console.error("PDF Export failure", err);
            toast.error("Export failed.", { id: 'pdf-toast' });
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end divider-soft pb-8 gap-6">
                <div>
                   <h1 className="text-3xl font-bold tracking-tighter uppercase text-zinc-950">Analytics</h1>
                   <p className="label-mono mt-2">Store Performance Overview</p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase text-zinc-400">Export Window</span>
                        <select 
                            value={statsPeriod}
                            onChange={(e) => setStatsPeriod(e.target.value)}
                            className="bg-white border-main px-3 py-2 text-[10px] font-bold uppercase tracking-wider outline-none"
                        >
                            {PERIOD_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                      onClick={handleDownloadPdf}
                      className="mt-auto px-6 py-3 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                    >
                        Download Sales PDF
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        label: `Revenue (${statsPeriod})`, 
                        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalRevenue), 
                        accent: 'bg-zinc-950 text-white' 
                    },
                    { label: `Orders (${statsPeriod})`, value: stats.totalOrders, accent: 'bg-white' },
                    { label: 'Active Users', value: stats.totalUsers, accent: 'bg-white' },
                    { label: 'Products in Store', value: stats.totalProducts, accent: 'bg-white' },
                ].map((s, idx) => (
                    <div key={idx} className={`p-8 border-main shadow-sm ${s.accent}`}>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</span>
                        <p className="text-2xl font-bold tracking-tighter mt-2">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* chart has its own independent window selector built inside SalesChart */}
            <SalesChart window={chartPeriod} setWindow={setChartPeriod} />
        </div>
    );
};

export default AdminMetricsPage;
