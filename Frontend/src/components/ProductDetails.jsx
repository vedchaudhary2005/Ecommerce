import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useSweetsContext } from '../hooks/useSweetsContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, showToast } = useCart();
  const { sweets, loading } = useSweetsContext();
  
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  
  // Find product
  useEffect(() => {
    if (!loading && sweets.length > 0) {
      const foundProduct = sweets.find(s => (s.id === id || s._id === id));
      setProduct(foundProduct);
      
      if (foundProduct) {
        // Set first image as active
        const defaultImage = (foundProduct.images && foundProduct.images.length > 0) 
          ? foundProduct.images[0] 
          : foundProduct.image;
        setActiveImage(defaultImage);
      }
    }
  }, [id, sweets, loading]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      image: product.image, // Main image for cart
      category: product.category,
      rating: product.rating
    };
    
    addToCart(cartItem);
    showToast(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/collections')}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Back to Collections
        </button>
      </div>
    );
  }

  // Get all images (handle fallback for old products with single image)
  const allImages = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.image].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-pink-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Column: Image Gallery */}
            <div className="w-full md:w-1/2 p-6 bg-gray-50 border-r border-gray-100">
              {/* Main Image */}
              <div className="relative h-[400px] sm:h-[500px] w-full bg-white rounded-lg overflow-hidden border border-gray-200 mb-4 shadow-sm">
                <img 
                  src={activeImage} 
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-gray-400">Image not available</span>
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all bg-white ${
                        activeImage === imgUrl ? 'border-pink-600 shadow-md transform scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
              
              <div className="mb-2 text-sm font-medium text-pink-600 tracking-wider uppercase">
                {product.category}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-yellow-700">{product.rating}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">₹{product.price}</span>
                <span className="text-gray-500 ml-2">incl. of all taxes</span>
              </div>
              
              <div className="mb-8 flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Description</h3>
                <div className="prose prose-sm sm:prose text-gray-600">
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-gray-100">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 transform hover:-translate-y-1"
                >
                  <Plus className="w-6 h-6" />
                  <span>Add to Cart</span>
                </button>
              </div>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProductDetails;
