import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top whenever route changes
    window.scrollTo(0, 0)
  }, [pathname])

  return null // This component doesn't render anything
}

export default ScrollToTop