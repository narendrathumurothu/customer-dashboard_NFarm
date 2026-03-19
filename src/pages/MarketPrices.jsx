import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MarketPrices = () => {
  const [prices, setPrices]         = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('commodity');
  const [sortOrder, setSortOrder]   = useState('asc');

  useEffect(() => { fetchPrices(); }, []);

  useEffect(() => {
    let result = [...prices];
    if (search) result = result.filter(p =>
      p.commodity?.toLowerCase().includes(search.toLowerCase()) ||
      p.market?.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      let valA = a[sortBy]; let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFiltered(result);
  }, [search, prices, sortBy, sortOrder]);

  const fetchPrices = async () => {
    try {
      const res  = await fetch('http://localhost:4000/marketprice/getallprices');
      const data = await res.json();
      setPrices(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const getPriceStatus = (price) => {
    if (price >= 3000) return { icon: <TrendingUp size={14} />,   color: '#ef4444', label: 'Very High' };
    if (price >= 2000) return { icon: <TrendingUp size={14} />,   color: '#f97316', label: 'High' };
    if (price >= 1000) return { icon: <Minus size={14} />,        color: '#eab308', label: 'Medium' };
    return               { icon: <TrendingDown size={14} />,  color: '#22c55e', label: 'Low' };
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const avgPrice     = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b.modalPrice, 0) / prices.length) : 0;
  const highestPrice = prices.length > 0 ? Math.max(...prices.map(p => p.modalPrice)) : 0;
  const lowestPrice  = prices.length > 0 ? Math.min(...prices.map(p => p.modalPrice)) : 0;
  const highestItem  = prices.find(p => p.modalPrice === highestPrice);
  const lowestItem   = prices.find(p => p.modalPrice === lowestPrice);

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">📊 Market Prices</h2>
        <p className="text-gray-500 text-sm">🌾 Live Government Market Prices</p>
      </div>

      {/* ✅ Unit Info Banner */}
      <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">ℹ️</span>
        <div>
          <p className="text-blue-700 text-sm font-medium">
            Govt prices are per Quintal (100 kg)
          </p>
          <p className="text-blue-500 text-xs">
            1 Quintal = 100 kg | ₹1000/quintal = ₹10/kg
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { emoji: '📦', label: 'Total',         value: prices.length,                                   color: '#3b82f6' },
          { emoji: '💰', label: 'Avg/Quintal',   value: `₹${avgPrice}`,                                  color: '#16a34a' },
          { emoji: '🔺', label: 'Highest',        value: `₹${highestPrice}`, sub: highestItem?.commodity, color: '#ef4444' },
          { emoji: '🔻', label: 'Lowest',         value: `₹${lowestPrice}`,  sub: lowestItem?.commodity,  color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl mb-1">{stat.emoji}</p>
            <p className="font-bold text-lg" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-gray-400 text-xs">{stat.label}</p>
            {stat.sub && <p className="text-gray-500 text-xs mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commodity or market..."
          className="flex-1 text-sm outline-none" />
        {search && (
          <button onClick={() => setSearch('')}>
            <x size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12"><p className="text-6xl">⏳</p></div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">

          {/* Table Header */}
          <div className="grid grid-cols-4 bg-green-500 px-4 py-3">
            {[
              { label: '🌾 Commodity', field: 'commodity' },
              { label: '🏪 Market',    field: 'market' },
              { label: '💰 Price',     field: 'modalPrice' },
              { label: '📈 Status',    field: null },
            ].map((col, i) => (
              <button key={i} onClick={() => col.field && handleSort(col.field)}
                className="text-white text-xs font-bold text-left">
                {col.label} {sortBy === col.field ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>

          {/* Table Rows */}
          <div>
            {filtered.map((price, index) => {
              const status  = getPriceStatus(price.modalPrice);
              const perKg   = Math.round(price.modalPrice / 100);

              return (
                <div key={index}
                  className="grid grid-cols-4 px-4 py-3 hover:bg-gray-50 transition-all"
                  style={{ borderBottom: '1px solid #f3f4f6' }}>

                  {/* Commodity */}
                  <p className="text-gray-800 text-sm font-medium">{price.commodity}</p>

                  {/* Market */}
                  <p className="text-gray-500 text-sm">{price.market || '—'}</p>

                  {/* ✅ Price - Quintal + kg */}
                  <div>
                    <p className="text-gray-800 text-sm font-bold">
                      ₹{price.modalPrice}
                      <span className="text-gray-400 text-xs font-normal">/q</span>
                    </p>
                    <p className="text-green-600 text-xs font-medium">
                      ≈ ₹{perKg}/kg
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1" style={{ color: status.color }}>
                    {status.icon}
                    <span className="text-xs font-medium">{status.label}</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;