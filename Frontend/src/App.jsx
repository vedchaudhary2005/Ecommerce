import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import './App.css'
import LoginPopup from './components/LoginPopup'
import Header from './components/Header'
import Footer from './components/Footer'
import SweetsMenu from './components/SweetsMenu'
import CollectionsPage from './components/CollectionsPage'
import AddtoCart from './components/AddtoCart'
import ScrollToTop from './components/ScrollToTop'
import Toast from './components/Toast'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'
import UnifiedLogin from './components/UnifiedLogin'
import ProceedToOrder from './components/ProceedToOrder'
import Orders from './components/Orders'
import Help from './components/Help'
import ProductDetails from './components/ProductDetails'
import NetworkTest from './components/NetworkTest'
import TestAuth from './components/TestAuth'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { SweetsProvider } from './context/SweetsContext'
import { useCart } from './hooks/useCart'
import { useAuth } from './hooks/useAuth'

// App content component to access cart context
const AppContent = ({ showLogin, setShowLogin }) => {
  // Access cart context for toast notifications
  const { toast, hideToast } = useCart()
  // Access auth context
  const { isAdmin } = useAuth()
  // Get current location for conditional footer rendering
  const location = useLocation()

  return (
    <>
      {/* Scroll to top on route change */}
      <ScrollToTop />
      
      {/* Navbar appears on all pages */}
      <Navbar setShowLogin={setShowLogin} />
      
      {/* Login popup - shows conditionally on all pages */}
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      
      {/* Route-based page rendering */}
      <Routes>
        {/* Home page route - shows Header and SweetsMenu */}
        <Route 
          path="/" 
          element={
            <>
              <Header/>
              <SweetsMenu/>
            </>
          } 
        />
        
        {/* Collections page route - shows only CollectionsPage */}
        <Route 
          path="/collections" 
          element={<CollectionsPage />} 
        />
        
        {/* Product details route */}
        <Route 
          path="/product/:id" 
          element={<ProductDetails />} 
        />
        
        {/* Legacy search route - redirect to collections */}
        <Route 
          path="/search" 
          element={<CollectionsPage />} 
        />
        
        {/* Cart page route - shows only Cart */}
        <Route 
          path="/cart" 
          element={<AddtoCart />} 
        />
        
        {/* Unified Login route */}
        <Route 
          path="/login" 
          element={<UnifiedLogin />} 
        />
        
        {/* Added order flow rout */}
        <Route 
          path="/proceed-to-order" 
          element={<ProceedToOrder />} 
        />
        
        {/* Added order flow route */}
        <Route 
          path="/orders" 
          element={<Orders />} 
        />
        
        {/* Help page route */}
        <Route 
          path="/help" 
          element={<Help />} 
        />
        
        {/* Admin Login route - legacy */}
        <Route 
          path="/admin-login" 
          element={<AdminLogin />} 
        />
        
        {/* Admin Dashboard route - admin only */}
        <Route 
          path="/admin-dashboard" 
          element={isAdmin() ? <AdminDashboard /> : <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Access Denied</p></div>} 
        />
        
        {/* Admin Panel route - same as dashboard */}
        <Route 
          path="/admin-panel" 
          element={isAdmin() ? <AdminDashboard /> : <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Access Denied</p></div>} 
        />
        
        {/* Legacy admin route - redirect to dashboard */}
        <Route 
          path="/admin" 
          element={isAdmin() ? <AdminDashboard /> : <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Access Denied</p></div>} 
        />
        
        {/* Network Test route - for debugging mobile issues */}
        <Route 
          path="/network-test" 
          element={<NetworkTest />} 
        />
        
        {/* Test Auth route - for development */}
        <Route 
          path="/test-auth" 
          element={<TestAuth />} 
        />
      </Routes>
      
      {/* Footer appears only on home page */}
      {location.pathname === '/' && <Footer/>}
      
      {/* Toast notification for cart actions */}
      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}

function App() {
  // Login popup state management
  const [showLogin, setShowLogin] = useState(false)

  return (
    // Auth Provider for global authentication state
    <AuthProvider>
      {/* Sweets Provider for global sweets state */}
      <SweetsProvider>
        {/* Cart Provider for global cart state */}
        <CartProvider>
          {/* Router wrapper for navigation between pages */}
          <Router>
            {/* App content with cart context access */}
            <AppContent showLogin={showLogin} setShowLogin={setShowLogin} />
          </Router>
        </CartProvider>
      </SweetsProvider>
    </AuthProvider>
  )
}

export default App
