import React, { useEffect, useState } from 'react';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

const OrderSuccess = ({ setActivePage }) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setActivePage('orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 mb-2">Your order has been placed successfully!</p>
        <p className="text-gray-400 text-sm mb-6">
          💵 Cash on Delivery — Delivery 
        </p>
        <div className="bg-green-50 rounded-xl px-4 py-3 mb-6">
          <p className="text-green-600 text-sm font-medium">
            🚚 Delivery in 1 day
          </p>
        </div>
        <p className="text-gray-400 text-xs mb-4">
          {count} it redirecting to My Orders page... ⏳
        </p>
        <div className="flex gap-3">
          <button onClick={() => setActivePage('home')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium">
            <Home size={16} /> Home
          </button>
          <button onClick={() => setActivePage('orders')}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl text-sm font-medium">
            <ShoppingBag size={16} /> My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;