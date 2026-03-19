import React, { useState, useEffect } from 'react';
import { Package, X } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

const statusColors = {
  'Pending':   { bg: '#fefce8', color: '#ca8a04', emoji: '⏳' },
  'Confirmed': { bg: '#eff6ff', color: '#2563eb', emoji: '✅' },
  'Delivered': { bg: '#f0fdf4', color: '#16a34a', emoji: '🎉' },
  'Cancelled': { bg: '#fef2f2', color: '#dc2626', emoji: '❌' },
};

const Orders = ({ setActivePage }) => {
  const customerId = localStorage.getItem('customerId');
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`http://localhost:4000/orders/my-orders/${customerId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res  = await fetch(`http://localhost:4000/orders/cancel/${orderId}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('✅ Order cancelled!');
        fetchOrders();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to cancel');
      }
    } catch { setError('Server error!'); }
  };

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">📦 My Orders</h2>
        <p className="text-gray-500 text-sm">{orders.length} orders found</p>
      </div>

      {success && <div className="bg-green-50 rounded-xl px-4 py-3"><p className="text-green-600 text-sm">{success}</p></div>}
      {error   && <div className="bg-red-50 rounded-xl px-4 py-3"><p className="text-red-600 text-sm">❌ {error}</p></div>}

      {loading ? (
        <div className="text-center py-12"><p className="text-6xl">⏳</p></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-6xl mb-4">📦</p>
          <h3 className="text-xl font-bold text-gray-800">No Orders Yet</h3>
          <p className="text-gray-500 mt-2 mb-4">Order The fresh products</p>
          <button onClick={() => setActivePage('products')}
            className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-medium">
            🛍️ Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusColors[order.status] || statusColors['Pending'];
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                {/* Order Header */}
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ background: status.bg }}>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      📅 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 rounded-full font-medium"
                      style={{ background: status.color, color: 'white' }}>
                      {status.emoji} {order.status}
                    </span>
                    {order.status === 'Pending' && (
                      <button onClick={() => handleCancel(order._id)}
                        className="bg-red-100 text-red-600 p-1.5 rounded-xl hover:bg-red-200 transition-all">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-5 py-3 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={`http://localhost:4000/uploads/${item.image}`}
                            alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
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

                {/* Order Footer */}
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-gray-500 text-xs">📍 {order.address}</p>
                    <p className="text-gray-500 text-xs">📱 {order.phone}</p>
                    <p className="text-gray-500 text-xs">💵 Cash on Delivery</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="font-bold text-green-600 text-lg">₹{order.totalAmount}</p>
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

export default Orders;