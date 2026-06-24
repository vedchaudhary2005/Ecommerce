import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Plus } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useSweetsContext } from '../hooks/useSweetsContext'

const SweetsMenu = () => {
  const { addToCart, showToast } = useCart()
  const { sweets, loading, error } = useSweetsContext()
  
  // Handle Add to Cart functionality for fashion products
  const handleAddToCart = (e, product) => {
    e.preventDefault() // Prevent Link navigation
    
    console.log('🛒 Adding to cart:', product);
    
    // Create cart item with proper product data
    const cartItem = {
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating
    }
    
    console.log('🛒 Cart item:', cartItem);
    
    addToCart(cartItem)
    showToast(`${product.name} added to cart!`)
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error && sweets.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500">Failed to load products. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Popular Products</h2>
          <p className="text-gray-600">Discover amazing traditional and modern fashion items</p>
        </div>

        {/* Responsive Grid Layout - 4 cards (desktop), 2 cards (tablet), 1 card (mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Debug info - remove after testing */}
          {sweets.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products available. Total products: {sweets.length}</p>
            </div>
          )}
          {sweets.map((product) => {
            return (
              <Link 
                key={product.id || product._id}
                to={`/product/${product.id || product._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden block"
              >
                {/* Fashion product card with navigation to details page */}
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {/* Product image with proper rendering and fallback */}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder - hidden by default, shown only if image fails */}
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center" style={{display: 'none'}}>
                    <span className="text-gray-500 text-sm">Product Image</span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">{product.name}</h3>
                  
                  {/* Category */}
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Category: {product.category}</p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-xl font-bold text-pink-700">
                      ₹{product.price}
                    </p>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SweetsMenu