import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Eye, EyeOff, Camera, Package, ShoppingBag } from 'lucide-react';

const backgroundImages = [
  'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg',
  'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg',
  'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg',
  'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
  'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg',
];

const Profile = ({ setActivePage }) => {
  const customerId = localStorage.getItem('customerId');
  const token      = localStorage.getItem('customerToken');

  const [currentBg, setCurrentBg]       = useState(0);
  const [customer, setCustomer]         = useState(null);
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [editMode, setEditMode]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photo, setPhoto]               = useState(null);

  const [editData, setEditData] = useState({
    name: '', email: '', phone: '', address: '',
  });

  const [passData, setPassData] = useState({
    newPassword: '', confirmPassword: '',
  });

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCustomer();
    fetchOrders();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res  = await fetch(
        `https://backend-node-js-nfarm.onrender.com/customers/single-customer/${customerId}`
      );
      const data = await res.json();
      if (res.ok) {
        setCustomer(data);
        setEditData({
          name:    data.name    || '',
          email:   data.email   || '',
          phone:   data.phone   || '',
          address: data.address || '',
        });
      }
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const res  = await fetch(
        `https://backend-node-js-nfarm.onrender.com/orders/my-orders/${customerId}`
      );
      const data = await res.json();
      if (res.ok) setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.log(err); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async () => {
    setError(''); setSuccess('');
    try {
      const form = new FormData();
      form.append('name',    editData.name);
      form.append('email',   editData.email);
      form.append('phone',   editData.phone);
      form.append('address', editData.address);
      if (photo) form.append('image', photo);

      const res  = await fetch(
        `https://backend-node-js-nfarm.onrender.com/customers/update-customer/${customerId}`,
        { method: 'PUT', body: form }
      );
      const data = await res.json();

      if (res.ok) {
        setSuccess('✅ Profile updated successfully!');
        localStorage.setItem('customerName', editData.name);
        setEditMode(false);
        fetchCustomer();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Update failed!');
      }
    } catch { setError('Server not connected!'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passData.newPassword !== passData.confirmPassword) {
      setError('Passwords do not match!'); return;
    }
    if (passData.newPassword.length < 6) {
      setError('Password must be at least 6 characters!'); return;
    }
    setSuccess('⚠️ Password change feature coming soon!');
  };

  const statusColors = {
    'Pending':   { bg: '#fefce8', color: '#ca8a04', emoji: '⏳' },
    'Confirmed': { bg: '#eff6ff', color: '#2563eb', emoji: '✅' },
    'Delivered': { bg: '#f0fdf4', color: '#16a34a', emoji: '🎉' },
    'Cancelled': { bg: '#fef2f2', color: '#dc2626', emoji: '❌' },
  };

  const totalSpent    = orders.reduce((a, b) => a + b.totalAmount, 0);
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="relative min-h-screen overflow-hidden"
      style={{ margin: '-24px', padding: '24px' }}>

      {/* Background */}
      {backgroundImages.map((img, index) => (
        <div key={index} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: currentBg === index ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out', zIndex: 0,
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1
      }} />

      <div style={{ position: 'relative', zIndex: 2 }} className="space-y-5">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white">👤 My Profile</h2>
          <p style={{ color: '#86efac' }} className="text-sm mt-1">
            🌾 Manage your account
          </p>
        </div>

        {/* Alerts */}
        {success && <div className="bg-green-50 rounded-xl px-4 py-3"><p className="text-green-700 text-sm">{success}</p></div>}
        {error   && <div className="bg-red-50 rounded-xl px-4 py-3"><p className="text-red-600 text-sm">❌ {error}</p></div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-2">⏳</p>
            <p className="text-white">Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}>

              <div className="flex items-start justify-between mb-5">
                <h3 className="font-bold text-gray-800 text-lg">👤 Customer Details</h3>
                <button onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: editMode ? '#fee2e2' : '#f0fdf4',
                    color:      editMode ? '#dc2626' : '#16a34a',
                  }}>
                  {editMode ? <><X size={14} /> Cancel</> : <><Edit size={14} /> Edit</>}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">

                {/* Photo */}
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <div className="relative">
                    {photoPreview || customer?.image ? (
                      <img
                        src={photoPreview || `https://backend-node-js-nfarm.onrender.com/uploads/${customer.image}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                        style={{ border: '4px solid #16a34a' }} />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center"
                        style={{ border: '4px solid #16a34a' }}>
                        <span className="text-white font-bold text-3xl">
                          {customer?.name?.charAt(0).toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                    {editMode && (
                      <label className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-green-600">
                        <Camera size={14} />
                        <input type="file" accept="image/*"
                          onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{customer?.name}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      🛒 Customer
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: '👤 Name',    key: 'name',    type: 'text'  },
                    { label: '📧 Email',   key: 'email',   type: 'email' },
                    { label: '📱 Phone',   key: 'phone',   type: 'text'  },
                    { label: '📍 Address', key: 'address', type: 'text'  },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        {field.label}
                      </label>
                      {editMode ? (
                        <input type={field.type} value={editData[field.key]}
                          onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                          className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none" />
                      ) : (
                        <p className="bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800">
                          {customer?.[field.key] || '—'}
                        </p>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <div className="md:col-span-2">
                      <button onClick={handleEditSave}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                        <Save size={14} /> Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '📦', label: 'Total Orders',    value: orders.length,      color: '#2563eb' },
                { emoji: '🎉', label: 'Delivered',       value: deliveredOrders,    color: '#16a34a' },
                { emoji: '💰', label: 'Total Spent',     value: `₹${totalSpent}`,   color: '#7c3aed' },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
                  <p className="text-3xl mb-1">{stat.emoji}</p>
                  <p className="font-bold text-xl" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Change Password */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}>
              <h3 className="font-bold text-gray-800 text-lg mb-4">🔒 Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">🔒 New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passData.newPassword}
                        onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                        placeholder="New password"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none pr-10"
                        required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">✅ Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
                      required />
                  </div>
                </div>
                <button type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                  🔒 Change Password
                </button>
              </form>
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}>
              <div className="flex justify-between items-center px-5 py-4">
                <h3 className="font-bold text-gray-800 text-lg">📦 Recent Orders</h3>
                <button onClick={() => setActivePage('orders')}
                  className="text-green-600 text-sm font-medium">
                  View All →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="px-5 pb-5 text-center">
                  <p className="text-5xl mb-3">🛒</p>
                  <p className="text-gray-500 text-sm">No orders yet!</p>
                  <button onClick={() => setActivePage('products')}
                    className="mt-3 bg-green-500 text-white px-5 py-2 rounded-xl text-sm">
                    🛍️ Shop Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.slice(0, 3).map((order, index) => {
                    const status = statusColors[order.status] || statusColors['Pending'];
                    return (
                      <div key={index} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            📅 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.items?.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{order.totalAmount}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: status.bg, color: status.color }}>
                            {status.emoji} {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {backgroundImages.map((_, index) => (
            <div key={index} onClick={() => setCurrentBg(index)} style={{
              height: '6px', width: currentBg === index ? '24px' : '8px',
              borderRadius: '3px', cursor: 'pointer',
              background: currentBg === index ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Profile;