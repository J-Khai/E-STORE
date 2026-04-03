import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import axios from '../../api/axios';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 });
  const [paidOrderCount, setPaidOrderCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                axios.get('/admin/stats'),
                axios.get('/admin/orders'),
            ]);
            setStats(statsRes.data);
            const paid = Array.isArray(ordersRes.data)
                ? ordersRes.data.filter(o => o.status === 'PAID').length
                : 0;
            setPaidOrderCount(paid);
        } catch (err) {
            console.error("Could not load dashboard statistics.", err);
        }
    };

    fetchStats(); // immediate on mount / route change

    // auto-refresh every 30 seconds so the count drops when orders get processed
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Re-sync when switching views

  const adminMenu = [
    { name: 'Analytics', path: '/admin/metrics' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' }
  ];

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <header className="mb-20">
          <h2 className="label-mono mb-4 text-zinc-950/30 uppercase tracking-widest">Store Admin</h2>
          <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-950">Dashboard</p>
        </header>

        <nav className="space-y-8 flex-grow">
          {adminMenu.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path}
              className={({ isActive }) => 
                `nav-item block text-[10px] uppercase font-bold tracking-[0.2em] transition-all
                 ${isActive ? 'text-zinc-950 border-l-4 border-zinc-950 pl-6' : 'text-zinc-950/30 hover:text-zinc-950 hover:pl-2'}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <footer className="mt-20 pt-20 divider-soft">
             <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                      <span className="label-mono text-[8px] uppercase opacity-40">New Orders</span>
                      <div className="flex items-center gap-2">
                          <p className="text-sm font-bold mono">{paidOrderCount}</p>
                          {paidOrderCount > 0 && (
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                          )}
                      </div>
                  </div>
                  <div className="space-y-1">
                      <span className="label-mono text-[8px] uppercase opacity-40">Users</span>
                      <p className="text-sm font-bold mono">{stats.totalUsers}</p>
                  </div>
             </div>
        </footer>
      </aside>

      <main className="flex-1 bg-zinc-50 p-12 lg:p-20 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
