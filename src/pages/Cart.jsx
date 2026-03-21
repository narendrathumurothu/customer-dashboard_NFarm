import React from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

const Cart = ({ cart, removeFromCart, updateQty, onCheckout }) => {
  const total    = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const totalQty = cart.reduce((a, b) => a + b.qty, 0);

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">🛒 My Cart</h2>
        <p className="text-gray-500 text-sm">{totalQty} items in cart</p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-7xl mb-4">🛒</p>
          <h3 className="text-xl font-bold text-gray-800">Cart is Empty!</h3>
          <p className="text-gray-500 mt-2">Add Products to cart </p>
        </div>
      ) : (
        <div className="md:flex gap-5 items-start">

          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {cart.map((item, index) => (
              <div key={index}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={`https://backend-node-js-nfarm.onrender.com/uploads/${item.image}`}
                      alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {categoryEmojis[item.category] || '🌾'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{item.productName}</p>
                  <p className="text-gray-400 text-xs">{categoryEmojis[item.category]} {item.category}</p>
                  <p className="text-green-600 font-bold text-sm mt-0.5">₹{item.price}/unit</p>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item._id, item.qty - 1)}
                    className="px-3 py-2 text-gray-500 font-bold hover:bg-gray-100">−</button>
                  <span className="px-3 py-2 font-bold text-gray-800">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)}
                    className="px-3 py-2 text-gray-500 font-bold hover:bg-gray-100">+</button>
                </div>
                <p className="font-bold text-gray-800 w-20 text-right">₹{item.price * item.qty}</p>
                <button onClick={() => removeFromCart(item._id)}
                  className="text-red-400 hover:text-red-600 transition-all p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:w-80 mt-4 md:mt-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-20">
              <h3 className="font-bold text-gray-800 text-lg mb-4">💰 Order Summary</h3>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <p className="text-gray-500">{item.productName} × {item.qty}</p>
                    <p className="text-gray-800 font-medium">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-500">Subtotal ({totalQty} items)</p>
                  <p className="text-gray-800">₹{total}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-500">Delivery</p>
                  <p className="text-green-600 font-medium">FREE 🎉</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-500">Payment</p>
                  <p className="text-gray-800">Cash on Delivery</p>
                </div>
                <div className="flex justify-between font-bold text-base pt-2"
                  style={{ borderTop: '1px solid #e5e7eb' }}>
                  <p>Total</p>
                  <p className="text-green-600">₹{total}</p>
                </div>
              </div>

              {/* ✅ Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                <ShoppingBag size={18} /> Checkout • ₹{total}
              </button>
              <p className="text-gray-400 text-xs text-center mt-2">🔒 Secure checkout</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;