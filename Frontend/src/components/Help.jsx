import React from 'react';
import { Mail, Phone, User } from 'lucide-react';

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24"> {/* Added extra bottom padding for mobile nav */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600">Need assistance? Get in touch with our support team</p>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center">
            {/* Profile Image */}
            <div className="mb-6">
              <img
                src="/aastha.png.jpeg"
                alt="Aastha Vikas Verma"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-pink-100 shadow-md"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center justify-center space-x-3">
                <User className="w-6 h-6 text-pink-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Aastha Vikas Verma</h2>
                  <p className="text-gray-600">Owner</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-pink-600" />
                <div className="text-left">
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href="mailto:shreeradhe0708@gmail.com"
                    className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition-colors"
                  >
                    shreeradhe0708@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-pink-600" />
                <div className="text-left">
                  <p className="text-sm text-gray-600">Phone</p>
                  <a 
                    href="tel:+919310413217"
                    className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition-colors"
                  >
                    +91 93104 13217
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Help Text */}
            <div className="mt-8 p-6 bg-pink-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How can we help?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Whether you have questions about orders, need technical support, or want to provide feedback, 
                we're here to help. Feel free to reach out via email or phone during business hours.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I place an order?</h3>
              <p className="text-gray-600">Browse our collection, select your favorite products, add them to your cart, and proceed to secure checkout to complete your purchase.</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Do you offer returns or refunds?</h3>
              <p className="text-gray-600">No. All sales are final. We do not offer returns, exchanges, or refunds once an order has been placed and processed.</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept online payments only through secure payment methods. Cash on Delivery (COD) is not available.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How long does delivery take?</h3>
              <p className="text-gray-600">Orders are typically delivered within 3–5 business days, depending on your location and courier service availability.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
