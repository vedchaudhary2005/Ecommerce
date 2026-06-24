import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Plus, ChevronDown } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useSweetsContext } from '../hooks/useSweetsContext'
import { ALL_CATEGORIES } from '../constants/categories'

const CollectionsPage = () => {
  const { addToCart, showToast } = useCart()
  const { sweets, loading: sweetsLoading } = useSweetsContext()
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [sortOption, setSortOption] = useState('Latest')
  const [filteredProducts, setFilteredProducts] = useState([])
  
  // Categories for fashion e-commerce - from centralized constants
  const categories = ALL_CATEGORIES
  
  // Sort options
  const sortOptions = [
    'Latest',
    'Price Low to High',
    'Price High to Low'
  ]

  // Filter and sort products
  useEffect(() => {
    let filtered = [...sweets]
    
    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    // Sort products
    switch (sortOption) {
      case 'Price Low to High':
        filtered.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'Price High to Low':
        filtered.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'Latest':
      default:
        // Keep original order (latest first from backend)
        break
    }
    
    setFilteredProducts(filtered)
  }, [sweets, selectedCategory, sortOption])

  // Handle Add to Cart functionality for fashion products
  const handleAddToCart = (product) => {
    console.log('🛒 Adding to cart (Collections):', product);
    
    const cartItem = {
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating
    }
    
    console.log('🛒 Cart item (Collections):', cartItem);
    
    addToCart(cartItem)
    showToast(`${product.name} added to cart!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Collections Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Collections</h1>
          <p className="text-gray-600">Discover our amazing range of jewellery, sarees, suits and accessories</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-pink-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar - Product Count and Sort */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Product Count */}
                <div className="text-gray-600">
                  <span className="font-medium">{filteredProducts.length}</span> products found
                  {selectedCategory !== 'All Categories' && (
                    <span className="text-sm ml-2">in {selectedCategory}</span>
                  )}
                </div>
                
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600"
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {sweetsLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                <p className="ml-2 text-gray-600">Loading products...</p>
              </div>
            )}

            {/* Products Grid */}
            {!sweetsLoading && (
              <>             
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      return (
                        <Link 
                          key={product.id || product._id}
                          to={`/product/${product.id || product._id}`}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden block"
                        >
                          {/* Product Image */}
                          <div className="relative h-48 bg-gray-200 overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            {/* Fallback placeholder */}
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
                              <p className="text-xl font-bold text-pink-600">
                                ₹{product.price}
                              </p>
                            </div>
                            
                            {/* Add to Cart Button */}
                            <button 
                              onClick={() => handleAddToCart(product)}
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
                ) : (
                  /* No products found */
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedCategory === 'All Categories' 
                          ? 'No products available yet.'
                          : `No products found in ${selectedCategory}`
                        }
                      </h3>
                      <p className="text-gray-500">
                        {selectedCategory === 'All Categories'
                          ? 'Products will appear here once added by admin.'
                          : 'Try selecting a different category or check back later.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage