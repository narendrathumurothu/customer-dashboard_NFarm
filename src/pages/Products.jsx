import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, X, TrendingDown, TrendingUp } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

const Products = ({ onProductClick, addToCart, onBuyNow }) => {
  const [products, setProducts]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [category, setCategory]         = useState('');
  const [minPrice, setMinPrice]         = useState('');
  const [maxPrice, setMaxPrice]         = useState('');
  const [showFilter, setShowFilter]     = useState(false);
  const [addedId, setAddedId]           = useState(null);
  const [quantities, setQuantities]     = useState({});

  useEffect(() => { fetchProducts(); fetchMarketPrices(); }, []);

  useEffect(() => {
    let result = [...products];
    if (search)   result = result.filter(p => p.productName?.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(p => p.category === category);
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    setFiltered(result);
  }, [search, category, minPrice, maxPrice, products]);

  const fetchProducts = async () => {
    try {
      const res  = await fetch('http://localhost:4000/products/allproducts');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchMarketPrices = async () => {
    try {
      const res  = await fetch('http://localhost:4000/marketprice/getallprices');
      const data = await res.json();
      setMarketPrices(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
  };

  // Product prices are added in quints from the api we divided into kg
  const getMarketPrice = (productName) => {
    if (!productName || marketPrices.length === 0) return null;
    const name = productName.toLowerCase().trim();

    // Exact match
    let match = marketPrices.find(m =>
      m.commodity?.toLowerCase().trim() === name
    );
    // Partial match
    if (!match) {
      match = marketPrices.find(m =>
        m.commodity?.toLowerCase().includes(name) ||
        name.includes(m.commodity?.toLowerCase().trim())
      );
    }

    if (!match) return null;

    return {
      perKg:      Math.round(match.modalPrice / 100),  //  quintal → kg
      perQuintal: match.modalPrice,
    };
  };

  const getQty = (productId) => quantities[productId] || 1;

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleAddToCart = (product) => {
    const qty = getQty(product._id);
    for (let i = 0; i < qty; i++) addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="space-y-5">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🛍️ All Products</h2>
          <p className="text-gray-500 text-sm">{filtered.length} products found</p>
        </div>
        <button onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 text-sm outline-none text-gray-600" />
        {search && <button onClick={() => setSearch('')}><X size={16} className="text-gray-400" /></button>}
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none">
              <option value="">All Categories</option>
              {Object.entries(categoryEmojis).map(([cat, emoji]) => (
                <option key={cat} value={cat}>{emoji} {cat}</option>
              ))}
            </select>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min Price ₹" className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none" />
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max Price ₹" className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none" />
          </div>
          <button onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); }}
            className="text-red-500 text-sm mt-3">🗑️ Clear Filters</button>
        </div>
      )}

      {/* Price Legend */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-4 flex-wrap">
        <p className="text-gray-600 text-xs font-medium">📊 Price Guide:</p>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <p className="text-xs text-gray-500">Vendor Price</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <p className="text-xs text-gray-500">Govt Market Price</p>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
          <p className="text-xs text-blue-600">ℹ️ Govt price: /quintal ÷ 100 = /kg</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12"><p className="text-6xl">⏳</p></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-gray-500">No products found!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product, index) => {
            const marketData  = getMarketPrice(product.productName);
            const marketPrice = marketData?.perKg;
            const savings     = marketPrice ? marketPrice - product.price : null;
            const isCheaper   = savings !== null && savings > 0;

            return (
              <div key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">

                {/* Image */}
                <div className="h-40 bg-gray-50 relative cursor-pointer"
                  onClick={() => onProductClick(product)}>
                  {product.image ? (
                    <img src={`http://localhost:4000/uploads/${product.image}`}
                      alt={product.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {categoryEmojis[product.category] || '🌾'}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {categoryEmojis[product.category]} {product.category}
                  </span>
                  {/* Savings Badge */}
                  {isCheaper && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      Save ₹{savings}!
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <p className="font-bold text-gray-800 text-sm">{product.productName}</p>
                  {product.farmingMethod && (
                    <p className="text-gray-400 text-xs mt-0.5">🚜 {product.farmingMethod}</p>
                  )}

                  {/* ✅ Price Comparison */}
                  <div className="mt-2 bg-gray-50 rounded-xl p-2 space-y-1">

                    {/* Vendor Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">🏪 Vendor:</span>
                      <span className="text-green-600 font-bold text-sm">
                        ₹{product.price}/kg
                      </span>
                    </div>

                    {/* Market Price */}
                    {marketData && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">📊 Market:</span>
                        <div className="text-right">
                          <span className="text-gray-400 text-xs line-through">
                            ₹{marketData.perKg}/kg
                          </span>
                          <span className="text-gray-300 text-xs ml-1">
                            (÷100 from ₹{marketData.perQuintal}/q)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Savings / Extra */}
                    {marketData && isCheaper && (
                      <div className="flex items-center justify-center gap-1 bg-green-50 rounded-lg py-1">
                        <TrendingDown size={10} className="text-green-600" />
                        <span className="text-green-600 text-xs font-bold">
                          Market కంటే ₹{savings}/kg తక్కువ! 🎉
                        </span>
                      </div>
                    )}
                    {marketData && !isCheaper && Math.abs(savings) > 0 && (
                      <div className="flex items-center justify-center gap-1 bg-orange-50 rounded-lg py-1">
                        <TrendingUp size={10} className="text-orange-500" />
                        <span className="text-orange-500 text-xs font-bold">
                          Market prices ₹{Math.abs(savings)}/kg high
                        </span>
                      </div>
                    )}
                    {!marketData && (
                      <p className="text-gray-400 text-xs text-center">
                        📊 Market price N/A
                      </p>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between mt-2 bg-gray-50 rounded-xl px-2 py-1.5">
                    <button onClick={() => updateQuantity(product._id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold text-lg hover:text-green-600">
                      −
                    </button>
                    <span className="text-gray-800 text-sm font-bold">
                      {getQty(product._id)} kg
                    </span>
                    <button onClick={() => updateQuantity(product._id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold text-lg hover:text-green-600">
                      +
                    </button>
                  </div>

                  {/* Total Price */}
                  <p className="text-center text-green-700 font-bold text-sm mt-1">
                    Total: ₹{product.price * getQty(product._id)}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: addedId === product._id ? '#16a34a' : '#f0fdf4',
                        color:      addedId === product._id ? 'white'   : '#16a34a',
                      }}>
                      <ShoppingCart size={12} />
                      {addedId === product._id ? '✅' : 'Cart'}
                    </button>
                    <button onClick={() => onBuyNow({ ...product, qty: getQty(product._id) })}
                      className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-all">
                      ⚡ Buy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;