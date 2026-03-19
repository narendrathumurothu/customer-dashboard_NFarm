import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const backgroundImages = [
  'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg',
  'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg',
  'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg',
  'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
  'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg',
];

const Login = ({ onLogin }) => {
  const [currentBg, setCurrentBg]       = useState(0);
  const [isRegister, setIsRegister]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem('language') || 'en'
  );

  const [formData, setFormData] = useState({
    name: '', email: '', Password: '', phone: '', address: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Google Translate language change
  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    localStorage.setItem('language', lang);

    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));

    if (lang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${lang}; expires=${date.toUTCString()}; path=/`;
      document.cookie = `googtrans=/en/${lang}; expires=${date.toUTCString()}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${lang}; expires=${date.toUTCString()}; path=/; domain=.${window.location.hostname}`;
    }

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = lang === 'en' ? '' : lang;
      select.dispatchEvent(new Event('change'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); setSuccess('');
    try {
      const url  = isRegister
        ? 'http://localhost:4000/customers/register'
        : 'http://localhost:4000/customers/login';
      const body = isRegister
        ? {
            name:     formData.name,
            email:    formData.email,
            Password: formData.Password,
            phone:    formData.phone,
            address:  formData.address,
          }
        : { email: formData.email, Password: formData.Password };

      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          setSuccess('✅ Registered successfully! Please login.');
          setIsRegister(false);
          setFormData({ name: '', email: '', Password: '', phone: '', address: '' });
        } else {
          localStorage.setItem('customerToken', data.token);
          localStorage.setItem('customerId',    data.customerId);
          localStorage.setItem('customerName',  data.name);
          localStorage.setItem('language',      selectedLang);
          onLogin();
        }
      } else {
        setError(data.message || 'Something went wrong Please Try again ');
      }
    } catch { setError('Server not connected!'); }
    setLoading(false);
  };

  const labels = {
    en: {
      selectLang:  'Select Language',
      login:       'Login',
      register:    'Register',
      name:        'Full Name',
      phone:       'Phone Number',
      address:     'Address',
      email:       'Email',
      password:    'Password',
      loginBtn:    'Login',
      registerBtn: 'Register',
    },
    te: {
      selectLang:  'భాష ఎంచుకోండి',
      login:       'లాగిన్',
      register:    'నమోదు చేయి',
      name:        'పూర్తి పేరు',
      phone:       'ఫోన్ నంబర్',
      address:     'చిరునామా',
      email:       'ఇమెయిల్',
      password:    'పాస్‌వర్డ్',
      loginBtn:    'లాగిన్ చేయండి',
      registerBtn: 'నమోదు చేయండి',
    },
    hi: {
      selectLang:  'भाषा चुनें',
      login:       'लॉगिन',
      register:    'पंजीकरण',
      name:        'पूरा नाम',
      phone:       'फोन नंबर',
      address:     'पता',
      email:       'ईमेल',
      password:    'पासवर्ड',
      loginBtn:    'लॉगिन करें',
      registerBtn: 'पंजीकरण करें',
    },
  };

  const L = labels[selectedLang] || labels.en;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

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
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1 }} />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <span className="text-5xl">🌾</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">NFarm</h1>
          <p className="text-gray-500 text-sm">Fresh Products from farm to your House</p>
        </div>

        {/* ✅ Language Select */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2 text-center">
            🌐 {L.selectLang}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: '🇬🇧 English' },
              { code: 'te', label: '🇮🇳 తెలుగు' },
              { code: 'hi', label: '🇮🇳 हिंदी' },
            ].map(lang => (
              <button key={lang.code} type="button"
                onClick={() => handleLangSelect(lang.code)}
                className="py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: selectedLang === lang.code ? '#16a34a' : '#f3f4f6',
                  color:      selectedLang === lang.code ? 'white'   : '#374151',
                }}>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: !isRegister ? '#16a34a' : 'transparent', color: !isRegister ? 'white' : '#6b7280' }}>
            🔐 {L.login}
          </button>
          <button onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: isRegister ? '#16a34a' : 'transparent', color: isRegister ? 'white' : '#6b7280' }}>
            📝 {L.register}
          </button>
        </div>

        {/* Alerts */}
        {error   && <div className="bg-red-50 rounded-xl px-4 py-3 mb-3"><p className="text-red-600 text-sm">❌ {error}</p></div>}
        {success && <div className="bg-green-50 rounded-xl px-4 py-3 mb-3"><p className="text-green-600 text-sm">{success}</p></div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">👤 {L.name}</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">📱 {L.phone}</label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">📍 {L.address}</label>
                <input type="text" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Your address"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">📧 {L.email}</label>
            <input type="email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" required />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">🔒 {L.password}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.Password}
                onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                placeholder="Enter password"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition-all">
            {loading ? '⏳ Please wait...' : isRegister ? `📝 ${L.registerBtn}` : `🔐 ${L.loginBtn}`}
          </button>
        </form>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {backgroundImages.map((_, index) => (
            <div key={index} onClick={() => setCurrentBg(index)} style={{
              height: '6px', width: currentBg === index ? '24px' : '8px',
              borderRadius: '3px', cursor: 'pointer',
              background: currentBg === index ? '#16a34a' : '#d1d5db',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;