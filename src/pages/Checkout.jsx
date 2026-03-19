import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, MapPin, Phone, User } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

const Checkout = ({ orderItems, setActivePage, setCart }) => {
  const customerId = localStorage.getItem('customerId');
  const customerName = localStorage.getItem('customerName') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [formData, setFormData] = useState({
    name:    customerName,
    phone:   '',
    address: '',
  });

  const total = orderItems.reduce((a, b) => a + b.price * b.qty, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('http://localhost:4000/orders/place', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          items: orderItems.map(item => ({
            productId:   item._id,
            productName: item.productName,
            price:       item.price,
            qty:         item.qty,
            image:       item.image,
            category:    item.category,
          })),
          totalAmount: total,
          name:        formData.name,
          phone:       formData.phone,
          address:     formData.address,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setCart([]);
        setActivePage('ordersuccess');
      } else {
        setError(data.message || 'Order failed!');
      }
    } catch { setError('Server down Please try some time'); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">

      <button onClick={() => setActivePage('cart')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
        <ArrowLeft size={18} /> Back to Cart
      </button>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">🛍️ Checkout</h2>
        <p className="text-gray-500 text-sm">Confirm the Order Details </p>
      </div>

      {error && (
        <div className="bg-red-50 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      <div className="md:flex gap-6 items-start">

        {/* Left - Form */}
        <div className="flex-1 space-y-4">

          {/* Delivery Details */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Delivery Details</h3>
            <form onSubmit={handlePlaceOrder} className="space-y-3">

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  <User size={12} className="inline mr-1" /> Full Name
                </label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
                  required />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  <Phone size={12} className="inline mr-1" /> Phone Number
                </label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
                  required />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  <MapPin size={12} className="inline mr-1" /> Delivery Address
                </label>
                <textarea value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full delivery address..."
                  rows={3}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  required />
              </div>

              {/* Payment */}
              <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Cash on Delivery</p>
                  <p className="text-gray-500 text-xs">You pay on Delivery </p>
                </div>
                <div className="ml-auto w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                <ShoppingBag size={20} />
                {loading ? '⏳ Placing Order...' : `Place Order • ₹${total}`}
              </button>

            </form>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="md:w-80 mt-4 md:mt-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-20">
            <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4">
              {orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={`http://localhost:4000/uploads/${item.image}`}
                        alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {categoryEmojis[item.category] || '🌾'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">{item.productName}</p>
                    <p className="text-gray-400 text-xs">₹{item.price} × {item.qty}</p>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-gray-500">Subtotal</p>
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
                style={{ borderTop: '1px solid #c1f22d' }}>
                <p>Total</p>
                <p className="text-green-600">₹{total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;