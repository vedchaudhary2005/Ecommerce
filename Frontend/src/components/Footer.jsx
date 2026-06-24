import React from 'react'
import { MessageCircle, Facebook, Instagram, Twitter, ChevronDown } from 'lucide-react'

const Footer = () => {
  return (
    // Fixed footer at bottom with 100% width and no gaps
    <footer className="bg-gray-100 text-gray-800 py-8 w-full bottom-0 left-0 right-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - Horizontal Flex Layout */}
        <div className="flex flex-wrap justify-between gap-8">
          
          {/* Left Section - Logo and Copyright */}
          <div className="flex-shrink-0">
            <div className="mb-4">
              {/* Logo Placeholder */}
              <h2 className="text-2xl font-bold text-pink-600 mb-2">Meher Collection</h2>
              {/* Copyright Line */}
              <p className="text-sm text-gray-600">
                © 2025 Meher Collection Limited. All rights reserved.
              </p>
            </div>
          </div>

          {/* Company Links Column */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Team</a></li>
            </ul>
          </div>

          {/* Contact Us Links Column */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Contact us</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Help & Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Partner with us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Ride with us</a></li>
            </ul>
          </div>

          {/* Legal Links Column */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Social Media Links */}
        <div className="border-t border-gray-300 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            {/* Social Media Icons */}
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <h4 className="text-sm font-medium text-gray-700 mr-2">Follow us:</h4>
              {/* WhatsApp */}
              <a href="#" className="text-gray-600 hover:text-green-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              {/* Facebook */}
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              {/* Instagram */}
              <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              {/* Twitter */}
              <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            
            {/* Additional Footer Text */}
            <div className="text-xs text-gray-500">
              Made with ❤️ for product lovers
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
