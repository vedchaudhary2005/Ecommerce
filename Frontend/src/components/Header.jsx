import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BACKEND_URL, API_ENDPOINTS } from '../api/config'

const Header = () => {
  // Slider state and configuration
  const [currentSlide, setCurrentSlide] = useState(0)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fallback images if no dynamic images are available
  const fallbackImages = [
    '/Header2.png',
    '/Header1.png', 
    '/Header1.png', 
    '/Header1.png'
  ]
  
  // Fetch slider images from API
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SLIDER.GET_ALL)
        const data = await response.json()
        
        if (data.success && data.data.images.length > 0) {
          // Use dynamic images from admin panel
          const imageUrls = data.data.images.map(img => `${BACKEND_URL}${img.imageUrl}`)
          setImages(imageUrls)
        } else {
          // Use fallback images if no dynamic images available
          setImages(fallbackImages)
        }
      } catch (error) {
        console.error('Error fetching slider images:', error)
        // Use fallback images on error
        setImages(fallbackImages)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSliderImages()
  }, [])

  // Auto-scroll functionality - changes slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images.length])

  // Manual navigation functions
  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Show loading state while fetching images
  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center mb-6 px-4">
          <h1 className="font-bold text-left text-xl sm:text-xl lg:text-3xl text-gray-800">
            Order your favourite Product Here
          </h1>
        </div>
        <div className="relative h-[40vw] sm:h-[34vw] mx-auto overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* HEADER TEXT - Above slider, centered and responsive */}
      <div className="text-center mb-6 px-4">
        <h1 className="font-bold text-left text-xl sm:text-xl lg:text-3xl text-gray-800">
          Order your favourite Products Here
        </h1>
      </div>

      {/* IMAGE SLIDER - Clean slider without text overlay */}
      <div className="relative h-[40vw] sm:h-[34vw] mx-auto overflow-hidden rounded-lg">
        <div className="slider-container relative w-full h-full">
          {/* Smooth scrolling image container */}
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full h-full">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-contain scale-x-110"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* SLIDER DOT NAVIGATION - Automatically generates dots based on images array length */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* BOTTOM TEXT CONTENT - Left aligned with responsive layout */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full">
          {/* Main heading - Left aligned, inline, responsive font size */}
          <h2 className="font-bold text-2xl sm:text-3xl mb-4 text-gray-800 text-left whitespace-nowrap">
            Explore Our Products Menu
          </h2>
          
          {/* Description text - Left aligned, proper line wrapping */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-left max-w-4xl">
           Explore beautiful ethnic fashion crafted to bring confidence, elegance, and charm to every celebration.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Header
