import { createContext, useState } from 'react'

// Create Cart Context
const CartContext = createContext()

// Cart Provider Component
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('meherCollectionCart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return []
    }
  })
  // Toast state for cart notifications
  const [toast, setToast] = useState({ message: '', isVisible: false })

  // Add item to cart with toast notification and localStorage persistence
  const addToCart = (sweet) => {
    console.log('🛒 CartContext: Adding to cart:', sweet)
    
    setCartItems(prev => {
      const productId = sweet.id || sweet._id
      console.log('🏷️ Using product ID:', productId)
      
      const existingItem = prev.find(item => {
        const itemId = item.id || item._id
        return itemId === productId
      })
      
      let newCart
      if (existingItem) {
        console.log('♻️ Item exists, incrementing quantity')
        newCart = prev.map(item => {
          const itemId = item.id || item._id
          return itemId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        })
      } else {
        console.log('✨ New item, adding to cart')
        const newItem = { 
          ...sweet, 
          id: productId, // Ensure consistent ID field
          quantity: 1 
        }
        console.log('📦 New cart item:', newItem)
        newCart = [...prev, newItem]
      }
      
      console.log('🛒 New cart state:', newCart)
      
      // Save to localStorage
      try {
        localStorage.setItem('meherCollectionCart', JSON.stringify(newCart))
        console.log('💾 Saved to localStorage')
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
      
      return newCart
    })
    
    // Show toast notification after adding to cart
    showToast('Item added to cart!')
  }

  // Remove item from cart with localStorage persistence
  const removeFromCart = (sweetId) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => {
        const itemId = item.id || item._id
        return itemId !== sweetId
      })
      // Save to localStorage
      try {
        localStorage.setItem('meherCollectionCart', JSON.stringify(newCart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
      return newCart
    })
  }

  // Increase item quantity with localStorage persistence
  const increaseQuantity = (sweetId) => {
    setCartItems(prev => {
      const newCart = prev.map(item => {
        const itemId = item.id || item._id
        return itemId === sweetId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      })
      // Save to localStorage
      try {
        localStorage.setItem('meherCollectionCart', JSON.stringify(newCart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
      return newCart
    })
  }

  // Decrease item quantity with localStorage persistence
  const decreaseQuantity = (sweetId) => {
    setCartItems(prev => {
      const newCart = prev.map(item => {
        const itemId = item.id || item._id
        return itemId === sweetId 
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      }).filter(item => item.quantity > 0)
      // Save to localStorage
      try {
        localStorage.setItem('meherCollectionCart', JSON.stringify(newCart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
      return newCart
    })
  }

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Clear entire cart - used after successful order placement
  const clearCart = () => {
    setCartItems([])
    // Remove cart from localStorage
    try {
      localStorage.removeItem('meherCollectionCart')
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error)
    }
  }

  // Show toast notification
  const showToast = (message) => {
    setToast({ message, isVisible: true })
  }

  // Hide toast notification
  const hideToast = () => {
    setToast({ message: '', isVisible: false })
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      getCartCount,
      clearCart,
      toast,
      showToast,
      hideToast
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Export CartContext for custom hook usage
export { CartContext }