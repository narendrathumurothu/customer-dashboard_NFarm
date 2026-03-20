import React, { useState } from 'react';
import Login          from './pages/Login';
import Home           from './pages/Home';
import Products       from './pages/Products';
import ProductDetail  from './pages/ProductDetail';
import MarketPrices   from './pages/MarketPrices';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import OrderSuccess   from './pages/OrderSuccess';
import Orders         from './pages/Orders';
import Navbar         from './components/Navbar';
import Profile        from './pages/Profile';

const App = () => {
  const [activePage, setActivePage]           = useState('home');
  const [isLoggedIn, setIsLoggedIn]           = useState(!!localStorage.getItem('customerToken'));
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart]                       = useState([]);
  const [orderItems, setOrderItems]           = useState([]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActivePage('home');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setActivePage('productdetail');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) return prev.map(p => p._id === product._id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(p => p._id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(p => p._id === productId ? { ...p, qty } : p));
  };

  const handleBuyNow = (product) => {
    setOrderItems([{ ...product, qty: 1 }]);
    setActivePage('checkout');
  };

  const handleCheckout = () => {
    setOrderItems(cart);
    setActivePage('checkout');
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return <Profile setActivePage={setActivePage} />
      case 'home':
        return <Home setActivePage={setActivePage} onProductClick={handleProductClick} addToCart={addToCart} onBuyNow={handleBuyNow} />;
      case 'products':
        return <Products onProductClick={handleProductClick} addToCart={addToCart} onBuyNow={handleBuyNow} />;
      case 'productdetail':
        return <ProductDetail product={selectedProduct} addToCart={addToCart} onBuyNow={handleBuyNow} setActivePage={setActivePage} />;
      case 'marketprices':
        return <MarketPrices />;
      case 'cart':
        return <Cart cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} onCheckout={handleCheckout} />;
      case 'checkout':
        return <Checkout orderItems={orderItems} setActivePage={setActivePage} setCart={setCart} />;
      case 'ordersuccess':
        return <OrderSuccess setActivePage={setActivePage} />;
      case 'orders':
        return <Orders setActivePage={setActivePage} />;
      default:
        return <Home setActivePage={setActivePage} onProductClick={handleProductClick} addToCart={addToCart} onBuyNow={handleBuyNow} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        cartCount={cart.reduce((a, b) => a + b.qty, 0)}
        onLogout={handleLogout}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;