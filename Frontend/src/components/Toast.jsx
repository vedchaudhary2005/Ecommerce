import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      // Auto-hide toast after 1 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    // Toast container - fixed position at top-right
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        {/* Success icon */}
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        
        {/* Toast message */}
        <span className="text-sm font-medium">{message}</span>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast