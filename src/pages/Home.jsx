import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight, MapPin, Search, X } from 'lucide-react';

const backgroundImages = [
  'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg',
  'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg',
  'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg',
  'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
  'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg',
];

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

// FIX: getDistance తీసేశాం — use అవ్వడం లేదు ✅

const Home = ({ setActivePage, onProductClick, addToCart, onBuyNow }) => {
  const customerName              = localStorage.getItem('customerName') || 'Customer';
  const [currentBg, setCurrentBg] = useState(0);
  const [products, setProducts]   = useState([]);
  const [firms, setFirms]         = useState([]);
  const [prices, setPrices]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [addedId, setAddedId]     = useState(null);

  const [locationInput, setLocationInput]     = useState('');
  const [userLocation, setUserLocation]       = useState(null);
  const [nearbyFirms, setNearbyFirms]         = useState([]);
  const [nearbyProducts, setNearbyProducts]   = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError]     = useState('');
  const [locationSet, setLocationSet]         = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [prodRes, firmRes, priceRes] = await Promise.all([
        fetch('https://backend-node-js-nfarm.onrender.com/products/allproducts'),
        fetch('https://backend-node-js-nfarm.onrender.com/firms/allfirms'),
        fetch('https://backend-node-js-nfarm.onrender.com/marketprice/getallprices'),
      ]);
      const [prodData, firmData, priceData] = await Promise.all([
        prodRes.json(), firmRes.json(), priceRes.json(),
      ]);
      setProducts(Array.isArray(prodData) ? prodData.slice(0, 6) : []);
      setFirms(Array.isArray(firmData?.firms) ? firmData.firms : []);
      setPrices(Array.isArray(priceData) ? priceData.slice(0, 5) : []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const getCoordinates = async (city) => {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    );
    const data = await res.json();
    if (data.length === 0) throw new Error('Location not found!');
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  };

  const handleLocationSearch = async () => {
    if (!locationInput.trim()) return;
    setLocationLoading(true);
    setLocationError('');
    try {
      const coords = await getCoordinates(locationInput);
      setUserLocation(coords);
      const res  = await fetch(
        `https://backend-node-js-nfarm.onrender.com/firms/nearby-firms?lat=${coords.lat}&lng=${coords.lng}&radius=50`
      );
      const data = await res.json();
      const nearFirms = data.firms || [];
      setNearbyFirms(nearFirms);
      const prodRes  = await fetch('https://backend-node-js-nfarm.onrender.com/products/allproducts');
      const prodData = await prodRes.json();
      if (Array.isArray(prodData) && nearFirms.length > 0) {
        const firmIds = nearFirms.map(f => f._id);
        const nearby  = prodData.filter(p => firmIds.includes(p.firm?._id || p.firm));
        setNearbyProducts(nearby);
      } else {
        setNearbyProducts([]);
      }
      setLocationSet(true);
      if (nearFirms.length === 0) {
        setLocationError('There are no Farms or products in your 60km region');
      }
    } catch (err) {
      setLocationError(err.message || 'Location not found!');
    }
    setLocationLoading(false);
  };

  const clearLocation = () => {
    setLocationInput('');
    setUserLocation(null);
    setNearbyFirms([]);
    setNearbyProducts([]);
    setLocationSet(false);
    setLocationError('');
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: '280px' }}>
        {backgroundImages.map((img, index) => (
          <div key={index} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: currentBg === index ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out', zIndex: 0,
          }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        <div className="relative z-10 p-8 md:p-12 flex flex-col justify-between" style={{ minHeight: '280px' }}>
          <div>
            <p style={{ color: '#86efac' }} className="text-sm font-medium mb-2">
              <center>🌾 Fresh from Farm to your house</center>
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              <center>Welcome to Nfarm, {customerName} 👋</center>
            </h1>
            <p className="text-green-200 mb-6">
              <center>Fresh farm products directly from farmers. Buy Fresh farm products for your Health</center>
            </p>
            <center>
              <button onClick={() => setActivePage('products')}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all">
                🛍️ Shop Now <ArrowRight size={18} />
              </button>
            </center>
          </div>
          <div className="flex gap-2 mt-6">
            {backgroundImages.map((_, index) => (
              <div key={index} onClick={() => setCurrentBg(index)} style={{
                height: '6px', width: currentBg === index ? '24px' : '8px',
                borderRadius: '3px', cursor: 'pointer',
                background: currentBg === index ? 'lightyellow' : 'rgba(216, 248, 121, 0.4)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* 📍 60km Nearby Farms */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">📍 Nearby Farms (60km)</h2>
          {locationSet && (
            <span className="ml-auto bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
              ✅ {nearbyFirms.length} farms found
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-3">
          Please Enter your city or area to see surrounding 60km farms and products
        </p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input type="text" value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
              placeholder="Enter your City or Area... e.g. Vishakapatnam"
              className="flex-1 text-sm outline-none bg-transparent text-gray-600" />
            {locationInput && (
              <button onClick={clearLocation}><X size={16} className="text-gray-400" /></button>
            )}
          </div>
          <button onClick={handleLocationSearch}
            disabled={locationLoading || !locationInput.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
            {locationLoading ? '⏳' : '🔍 Search'}
          </button>
        </div>
        {locationError && <p className="text-red-500 text-xs mt-2">❌ {locationError}</p>}
        {userLocation && !locationError && (
          <p className="text-green-600 text-xs mt-2">✅ {locationInput} — search in 60km radius</p>
        )}
        {locationSet && nearbyFirms.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-600 text-sm font-medium mb-3">🏡 {nearbyFirms.length} Farms near you:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nearbyFirms.map((firm, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <div className="h-24 bg-green-100">
                    {firm.image ? (
                      <img src={`https://backend-node-js-nfarm.onrender.com/uploads/${firm.image}`} alt={firm.firmName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">{categoryEmojis[firm.category] || '🌾'}</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-bold text-gray-800 text-xs">{firm.firmName}</p>
                    <p className="text-gray-400 text-xs">📍 {firm.area}</p>
                    {firm.distance !== undefined && (
                      <p className="text-green-600 text-xs font-medium mt-0.5">🚗 {firm.distance} km away</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {locationSet && nearbyProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-600 text-sm font-medium mb-3">📦 {nearbyProducts.length} Products from nearby farms:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nearbyProducts.slice(0, 8).map((product, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <div className="h-28 relative cursor-pointer" onClick={() => onProductClick(product)}>
                    {product.image ? (
                      <img src={`https://backend-node-js-nfarm.onrender.com/uploads/${product.image}`} alt={product.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-green-50">{categoryEmojis[product.category] || '🌾'}</div>
                    )}
                    <span className="absolute top-1 right-1 bg-white text-green-700 font-bold text-xs px-1.5 py-0.5 rounded-full shadow">₹{product.price}</span>
                  </div>
                  <div className="p-2">
                    <p className="font-bold text-gray-800 text-xs">{product.productName}</p>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => handleAddToCart(product)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1"
                        style={{ background: addedId === product._id ? '#16a34a' : '#bfe224', color: addedId === product._id ? 'white' : '#16a34a' }}>
                        <ShoppingCart size={10} />
                        {addedId === product._id ? '✅' : 'Cart'}
                      </button>
                      <button onClick={() => onBuyNow(product)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all">
                        Buy NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {locationSet && nearbyFirms.length === 0 && !locationError && (
          <div className="mt-4 bg-yellow-50 rounded-xl px-4 py-3">
            <p className="text-yellow-700 text-sm">There are no farms in your 60km radius. Try another area.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { emoji: '📦', label: 'Products',    value: products.length },
          { emoji: '🏡', label: 'Farms',       value: firms.length },
          { emoji: '📊', label: 'Commodities', value: prices.length },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl mb-1">{stat.emoji}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">🌿 Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(categoryEmojis).map(([cat, emoji]) => (
            <button key={cat} onClick={() => setActivePage('products')}
              className="flex-shrink-0 bg-white rounded-2xl px-4 py-3 text-center shadow-sm hover:shadow-md transition-all"
              style={{ minWidth: '80px' }}>
              <p className="text-2xl">{emoji}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{cat}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">🌟 Featured Products</h2>
          <button onClick={() => setActivePage('products')} className="text-green-600 text-sm font-medium flex items-center gap-1">
            View All <ArrowRight size={16} />
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8"><p className="text-5xl">⏳</p></div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-gray-500">No products yet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-36 bg-gray-50 relative cursor-pointer" onClick={() => onProductClick(product)}>
                  {product.image ? (
                    <img src={`https://backend-node-js-nfarm.onrender.com/uploads/${product.image}`} alt={product.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">{categoryEmojis[product.category] || '🌾'}</div>
                  )}
                  <span className="absolute top-2 right-2 bg-white text-green-700 font-bold text-xs px-2 py-0.5 rounded-full shadow">₹{product.price}</span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-gray-800 text-sm">{product.productName}</p>
                  <p className="text-gray-400 text-xs">{categoryEmojis[product.category]} {product.category}</p>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{ background: addedId === product._id ? '#16a34a' : '#f0fdf4', color: addedId === product._id ? 'white' : '#16a34a' }}>
                      <ShoppingCart size={12} />
                      {addedId === product._id ? '✅' : 'Cart'}
                    </button>
                    <button onClick={() => onBuyNow(product)}
                      className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-all">
                      ⚡ Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Prices */}
      {prices.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📊 Today's Market Prices</h2>
            <button onClick={() => setActivePage('marketprices')} className="text-green-600 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-green-500 px-4 py-2.5">
              <p className="text-white text-xs font-bold">🌾 Commodity</p>
              <p className="text-white text-xs font-bold">🏪 Market</p>
              <p className="text-white text-xs font-bold">💰 Price/kg</p>
            </div>
            {prices.map((price, index) => (
              <div key={index} className="grid grid-cols-3 px-4 py-3 hover:bg-gray-50"
                style={{ borderBottom: index < prices.length - 1 ? '1px solid #5d8dee' : 'none' }}>
                <p className="text-gray-800 text-sm font-medium">{price.commodity}</p>
                <p className="text-gray-500 text-sm">{price.market || '—'}</p>
                <div>
                  <p className="text-gray-500 text-xs">₹{price.modalPrice}/q</p>
                  <p className="text-green-600 text-sm font-bold">≈ ₹{Math.round(price.modalPrice / 100)}/kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;