import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Check, Zap, Star } from 'lucide-react';

const categoryEmojis = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains': '🌾',
  'Dairy': '🥛', 'Poultry': '🐔', 'Spices': '🌶️',
  'Livestock': '🐄', 'Others': '🌱',
};

const ProductDetail = ({ product, addToCart, onBuyNow, setActivePage }) => {
  const customerId    = localStorage.getItem('customerId');
  const customerToken = localStorage.getItem('customerToken');

  const [qty, setQty]         = useState(1);
  const [added, setAdded]     = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating]   = useState(5);
  const [review, setReview]   = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError]     = useState('');

  useEffect(() => {
    if (product?._id) fetchReviews();
  }, [product]);

  const fetchReviews = async () => {
    try {
      const res  = await fetch(`https://backend-node-js-nfarm.onrender.com/reviews/product/${product._id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) { console.log(err); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setReviewError('Login చేయి — review add చేయడానికి!');
      return;
    }
    setReviewLoading(true);
    setReviewError(''); setReviewSuccess('');
    try {
      const res  = await fetch('https://backend-node-js-nfarm.onrender.com/reviews/add', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'customer-token': customerToken,
        },
        body: JSON.stringify({
          productId: product._id,
          rating,
          review,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess('✅ Review added successfully!');
        setReview('');
        setRating(5);
        setShowReviewForm(false);
        fetchReviews();
        setTimeout(() => setReviewSuccess(''), 3000);
      } else {
        setReviewError(data.message || 'Failed!');
      }
    } catch { setReviewError('Server not connected!'); }
    setReviewLoading(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`https://backend-node-js-nfarm.onrender.com/reviews/${reviewId}`, {
        method:  'DELETE',
        headers: { 'customer-token': customerToken },
      });
      if (res.ok) { fetchReviews(); }
    } catch (err) { console.log(err); }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const renderStars = (count, interactive = false, size = 16) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={size}
            fill={i <= count ? '#eab308' : 'none'}
            stroke={i <= count ? '#eab308' : '#d1d5db'}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={interactive ? () => setRating(i) : undefined}
          />
        ))}
      </div>
    );
  };

  if (!product) return (
    <div className="text-center py-12">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-500 mb-4">Product not found!</p>
      <button onClick={() => setActivePage('products')}
        className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm">Back</button>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Back */}
      <button onClick={() => setActivePage('products')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
        <ArrowLeft size={18} /> Back to Products
      </button>

      {/* Product Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
        <div className="md:flex">

          {/* Image */}
          <div className="md:w-1/2 h-72 md:h-auto bg-gray-50 min-h-64">
            {product.image ? (
              <img src={`https://backend-node-js-nfarm.onrender.com/uploads/${product.image}`}
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
                <span className="text-sm text-gray-400 font-normal"> /kg</span>
              </p>

              {/* ✅ Rating Summary */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(Math.round(avgRating))}
                  <span className="text-gray-600 text-sm font-medium">{avgRating}</span>
                  <span className="text-gray-400 text-sm">({totalReviews} reviews)</span>
                </div>
              )}
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
                <span className="px-4 py-2 font-bold text-gray-800">{qty} kg</span>
                <button onClick={() => setQty(qty + 1)}
                  className="px-4 py-2 text-gray-500 font-bold text-xl hover:bg-gray-100">+</button>
              </div>
              <p className="text-green-600 font-bold">= ₹{product.price * qty}</p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg transition-all"
                style={{ background: added ? '#15803d' : '#16a34a' }}>
                {added
                  ? <><Check size={22} /> Added to Cart! ✅</>
                  : <><ShoppingCart size={22} /> Add to Cart</>}
              </button>
              <button onClick={() => onBuyNow({ ...product, qty })}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-orange-500 hover:bg-orange-600 text-white transition-all">
                <Zap size={22} /> ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* Reviews Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">⭐ Customer Reviews</h3>
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-1">
                {renderStars(Math.round(avgRating), false, 14)}
                <span className="text-gray-600 text-sm">{avgRating} / 5 ({totalReviews} reviews)</span>
              </div>
            )}
          </div>
          {customerId && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
              ✍️ {showReviewForm ? 'Cancel' : 'Write Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="px-5 py-4 bg-green-50 border-b border-gray-100">
            <h4 className="font-medium text-gray-800 mb-3">✍️ Write Your Review</h4>

            {reviewError   && <p className="text-red-600 text-sm mb-2">❌ {reviewError}</p>}
            {reviewSuccess && <p className="text-green-600 text-sm mb-2">{reviewSuccess}</p>}

            <form onSubmit={handleSubmitReview} className="space-y-3">
              {/* Star Rating */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">⭐ Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={28}
                      fill={i <= rating ? '#eab308' : 'none'}
                      stroke={i <= rating ? '#eab308' : '#d1d5db'}
                      className="cursor-pointer hover:scale-110 transition-all"
                      onClick={() => setRating(i)}
                    />
                  ))}
                  <span className="text-gray-500 text-sm ml-2 self-center">{rating}/5</span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">💬 Your Review</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  required />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={reviewLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
                  {reviewLoading ? '⏳ Submitting...' : '✅ Submit Review'}
                </button>
                <button type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-gray-500 text-sm">No reviews yet!</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to review this product</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((r, index) => (
              <div key={index} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {r.customerName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{r.customerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {renderStars(r.rating, false, 12)}
                        <span className="text-gray-400 text-xs">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Delete button - only for own reviews */}
                  {r.customer === customerId && (
                    <button onClick={() => handleDeleteReview(r._id)}
                      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-2 ml-12">{r.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductDetail;