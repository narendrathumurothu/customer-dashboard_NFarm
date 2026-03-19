import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Check, Zap } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

// we add buy now 
const ProductDetail = ({ product, addToCart, onBuyNow, setActivePage }) => {
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return (
    <div className="text-center py-12">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-500 mb-4">Product not found!</p>
      <button onClick={() => setActivePage('products')}
        className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm">Back</button>
    </div>
  );

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    onBuyNow({ ...product, qty });
  };

  return (
    <div className="space-y-5">

      <button onClick={() => setActivePage('products')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
        <ArrowLeft size={18} /> Back to Products
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
        <div className="md:flex">

          {/* Image */}
          <div className="md:w-1/2 h-72 md:h-auto bg-gray-50 min-h-64">
            {product.image ? (
              <img src={`http://localhost:4000/uploads/${product.image}`}
                alt={product.productName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl min-h-64">
                {categoryEmojis[product.category] || '🌾'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-6 space-y-4">
            <div>
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                {categoryEmojis[product.category]} {product.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-3">{product.productName}</h1>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₹{product.price}
                <span className="text-sm text-gray-400 font-normal"> /unit</span>
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '🚜 Farming',    value: product.farmingMethod },
                { label: '🌱 Variety',    value: product.variety },
                { label: '📍 Origin',     value: product.origin },
                { label: '🌤️ Season',    value: product.seasonality },
                { label: '⏳ Shelf Life', value: product.shelflife },
                { label: '⚖️ Weight',     value: product.sizeAndWeight },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="text-gray-800 text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <p className="text-gray-700 text-sm font-medium">Quantity:</p>
              <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 text-gray-500 font-bold text-xl hover:bg-gray-100">−</button>
                <span className="px-4 py-2 font-bold text-gray-800">{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                  className="px-4 py-2 text-gray-500 font-bold text-xl hover:bg-gray-100">+</button>
              </div>
              <p className="text-green-600 font-bold">= ₹{product.price * qty}</p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">

              {/* Add to Cart */}
              <button onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg transition-all"
                style={{ background: added ? '#15803d' : '#16a34a' }}>
                {added
                  ? <><Check size={22} /> Added to Cart! ✅</>
                  : <><ShoppingCart size={22} /> Add to Cart</>}
              </button>

              {/* ✅ Buy Now */}
              <button onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all">
                <Zap size={22} /> Buy Now
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;