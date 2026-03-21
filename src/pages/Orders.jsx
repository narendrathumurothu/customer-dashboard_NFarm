import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

// ─── Tracking Steps ────────────────────────────────────────────────────────────
const TRACKING_STEPS = [
  { key: 'Pending',          label: 'Order Placed',      emoji: '📦', desc: 'Your order has been placed successfully!' },
  { key: 'Confirmed',        label: 'Order Confirmed',   emoji: '✅', desc: 'Your order has been confirmed by admin!' },
  { key: 'Out for Delivery', label: 'Out for Delivery',  emoji: '🚚', desc: 'Your order is on the way!' },
  { key: 'Delivered',        label: 'Delivered',         emoji: '🎉', desc: 'Your order has been delivered!' },
];

const getStepIndex = (status) => {
  if (status === 'Cancelled') return -1;
  return TRACKING_STEPS.findIndex(s => s.key === status);
};

// ─── Order Tracking Component ──────────────────────────────────────────────────
const OrderTracking = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="mt-4 bg-red-50 rounded-2xl p-4 text-center">
        <p className="text-3xl mb-2">❌</p>
        <p className="font-bold text-red-600">Order Cancelled</p>
        <p className="text-red-400 text-xs mt-1">This order has been cancelled.</p>
      </div>
    );
  }

  const currentIndex = getStepIndex(status);

  return (
    <div className="mt-4 px-2">
      <div className="relative">
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '3px',
          background: '#e5e7eb',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          height: '3px',
          width: currentIndex <= 0 ? '0%' :
                 currentIndex === 1 ? '33%' :
                 currentIndex === 2 ? '66%' : '100%',
          background: 'linear-gradient(90deg, #16a34a, #22c55e)',
          zIndex: 1,
          transition: 'width 0.5s ease',
        }} />

        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {TRACKING_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent   = index === currentIndex;

            return (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {/* Circle */}
                <div style={{
                  width: 40, height: 40,
                  borderRadius: '50%',
                  background: isCompleted ? '#16a34a' : '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(22,163,74,0.2)' : 'none',
                  transition: 'all 0.3s',
                  border: isCurrent ? '2px solid #16a34a' : '2px solid transparent',
                }}>
                  {step.emoji}
                </div>

                {/* Label */}
                <p style={{
                  fontSize: 11, fontWeight: isCurrent ? 700 : 500,
                  color: isCompleted ? '#16a34a' : '#9ca3af',
                  marginTop: 6, textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {step.label}
                </p>

                {/* Current status indicator */}
                {isCurrent && (
                  <span style={{
                    fontSize: 9, background: '#16a34a', color: 'white',
                    padding: '2px 6px', borderRadius: 999, marginTop: 3,
                    fontWeight: 600,
                  }}>
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Message */}
      {currentIndex >= 0 && (
        <div style={{
          background: '#f0fdf4', borderRadius: 12, padding: '10px 16px',
          marginTop: 16, textAlign: 'center',
        }}>
          <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
            {TRACKING_STEPS[currentIndex].desc}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Orders Component ─────────────────────────────────────────────────────
const Orders = ({ setActivePage }) => {
  const customerId = localStorage.getItem('customerId');
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch(`https://backend-node-js-nfarm.onrender.com/orders/my-orders/${customerId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
    setLoading(false);
  }, [customerId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res  = await fetch(`https://backend-node-js-nfarm.onrender.com/orders/cancel/${orderId}`, { method: 'PUT' });
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

  const statusColors = {
    'Pending':          { bg: '#fefce8', color: '#ca8a04', emoji: '⏳' },
    'Confirmed':        { bg: '#eff6ff', color: '#2563eb', emoji: '✅' },
    'Out for Delivery': { bg: '#f0f9ff', color: '#0284c7', emoji: '🚚' },
    'Delivered':        { bg: '#f0fdf4', color: '#16a34a', emoji: '🎉' },
    'Cancelled':        { bg: '#fef2f2', color: '#dc2626', emoji: '❌' },
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
          <p className="text-gray-500 mt-2 mb-4">Order fresh products!</p>
          <button onClick={() => setActivePage('products')}
            className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-medium">
            🛍️ Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status     = statusColors[order.status] || statusColors['Pending'];
            const isExpanded = expandedOrder === order._id;

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
                          <img src={`https://backend-node-js-nfarm.onrender.com/uploads/${item.image}`}
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

                {/* ─── Flipkart Style Tracking ─── */}
                {order.status !== 'Cancelled' && (
                  <div className="px-5 pb-2">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="w-full text-center text-green-600 text-sm font-medium py-2 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                      {isExpanded ? '▲ Hide Tracking' : '▼ Track Order 🚚'}
                    </button>
                    {isExpanded && <OrderTracking status={order.status} />}
                  </div>
                )}

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