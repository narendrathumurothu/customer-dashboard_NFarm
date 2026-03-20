import React, { useState } from 'react';
import { ShoppingCart, Home, Package, TrendingUp, LogOut, Menu, X, ClipboardList } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ activePage, setActivePage, cartCount, onLogout }) => {
  const customerName  = localStorage.getItem('customerName') || 'Customer';
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { page: 'home',         label: 'Home',         icon: <Home size={18} /> },
    { page: 'products',     label: 'Products',      icon: <Package size={18} /> },
    { page: 'marketprices', label: 'Market Prices', icon: <TrendingUp size={18} /> },
    { page: 'orders',       label: 'My Orders',     icon: <ClipboardList size={18} /> },
  ];

  return (
    <nav className="bg-green-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActivePage('home')}>
          <span className="text-2xl">🌾</span>
          <span className="text-white font-bold text-xl">NFarm</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.page}
              onClick={() => setActivePage(item.page)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activePage === item.page ? 'rgba(197, 61, 61, 0.25)' : 'transparent',
                color: 'white',
              }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {/* ✅ Language Switcher - Desktop */}
          <div className="hidden md:block">
            <LanguageSwitcher style="navbar" />
          </div>

          {/* Cart */}
          <button onClick={() => setActivePage('cart')}
            className="relative p-2 rounded-xl transition-all"
            style={{ background: activePage === 'cart' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)' }}>
            <ShoppingCart size={20} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div onClick={() => setActivePage('profile')} className="hidden md:flex items-center gap-2 bg-white bg-opacity-20 rounded-xl px-3 py-2">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">
                {customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white text-sm font-medium">{customerName}</span>
          </div>
          

          {/* Logout */}
          <button onClick={onLogout}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-sm transition-all">
            <LogOut size={15} /> Logout
          </button>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-1">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-700 px-4 py-3 space-y-1">
          {navItems.map(item => (
            <button key={item.page}
              onClick={() => { setActivePage(item.page); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-white px-4 py-2.5 rounded-xl hover:bg-green-600 text-sm">
              {item.icon} {item.label}
            </button>
          ))}

          {/* Mobile Language Switcher */}
          <div className="pt-2 border-t border-green-600 mt-2">
            <p className="text-green-300 text-xs mb-2">🌐 Language:</p>
            <LanguageSwitcher style="sidebar" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;