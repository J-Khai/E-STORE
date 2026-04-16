import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/products' }
  ];

  return (
    <nav className="glass-nav">
      {/* desktop & main bar */}
      <div className="h-[64px] flex items-center justify-between px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link to="/" className="text-xl italic font-semibold text-zinc-950/90 logo-text tracking-tighter shrink-0">
            E-STORE
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border-main py-2 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-zinc-950 outline-none transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-950/30 hover:text-zinc-950">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Desktop Utils */}
        <div className="hidden md:flex items-center gap-8">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname.startsWith('/admin') ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              Admin
            </Link>
          )}

          {(!user || user?.role === 'CUSTOMER') && (
            <Link to="/cart" className="nav-link nav-link-inactive">Cart</Link>
          )}

          {isAuthenticated ? (
            <div className="relative border-l border-main pl-8 flex items-center">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 label-mono text-[11px] font-bold uppercase tracking-widest text-zinc-950/70 hover:text-zinc-950 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[8px] italic">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span>Dashboard</span>
                <svg className={`w-3 h-3 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute top-12 right-0 w-56 bg-white border-main shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-6 py-4 divider-soft">
                    <p className="label-mono text-[8px] uppercase opacity-40 mb-1">Logged in as</p>
                    <p className="label-mono text-[10px] text-zinc-950 truncate lowercase">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-950/60 hover:text-zinc-950 hover:bg-zinc-50 transition-all"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile/history"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-950/60 hover:text-zinc-950 hover:bg-zinc-50 transition-all"
                    >
                      Order History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5">Login</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-950 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 w-full bg-white divider-soft animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
          <div className="flex flex-col p-6 space-y-6">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 border-main py-4 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-zinc-950 outline-none"
              />
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link block ${location.pathname === link.path ? 'nav-link-active underline' : 'nav-link-inactive'}`}
              >
                {link.name}
              </Link>
            ))}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link block ${location.pathname.startsWith('/admin') ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                Admin Dashboard
              </Link>
            )}

            <div className="pt-6 divider-soft space-y-6">
              {(!user || user?.role === 'CUSTOMER') && (
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="nav-link block nav-link-inactive uppercase font-bold text-[10px]">Your Cart</Link>
              )}
              {user?.role === 'CUSTOMER' && (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="nav-link block nav-link-inactive uppercase font-bold text-[10px]">My Profile</Link>
                  <Link to="/profile/history" onClick={() => setIsMenuOpen(false)} className="nav-link block nav-link-inactive uppercase font-bold text-[10px]">Order History</Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="flex flex-col gap-4 pt-4 divider-soft">
                  <div className="flex items-center gap-4">
                    <span className="label-mono lowercase opacity-40">Logged in as {user?.email}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-primary w-full py-4 text-red-500 bg-red-50 border-red-100 italic tracking-widest uppercase text-[10px]">Sign Out</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-primary block text-center py-4">Login</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
