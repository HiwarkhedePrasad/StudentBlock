import React, { useState } from "react";

const HeroSection = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const toggleContactModal = () => {
    setShowContactModal(!showContactModal);
    if (!showContactModal) setShowDetailsModal(false);
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
    if (!showDetailsModal) setShowContactModal(false);
  };

  return (
    <section className="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen flex items-center justify-center px-6 relative">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Welcome to <span className="text-blue-600">Aanand Hostel</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Your second home with comfort, community, and convenience.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={toggleContactModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Book a Room
          </button>
          <button 
            onClick={toggleDetailsModal}
            className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl shadow-md hover:bg-blue-100 transition"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Book a Room</h2>
              <button 
                onClick={toggleContactModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Contact our hostel management to book your room:
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700">Hostel Manager</h3>
                  <p className="text-gray-700">Mr. Rajesh Sharma</p>
                  <p className="text-blue-600 font-medium text-lg mt-1">+91 98765 43210</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700">Hostel Office</h3>
                  <p className="text-gray-700">Open 9:00 AM - 6:00 PM</p>
                  <p className="text-blue-600 font-medium text-lg mt-1">+91 87654 32109</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:booking@aanandhostel.com" 
                className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition flex-1"
              >
                Email Us
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank"
                rel="noopener noreferrer" 
                className="bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700 transition flex-1"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">About Aanand Hostel</h2>
              <button 
                onClick={toggleDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Our Facilities</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>24/7 Wi-Fi connectivity</li>
                  <li>Clean and spacious rooms</li>
                  <li>Modern washrooms with hot water facility</li>
                  <li>Hygienic dining hall with quality food</li>
                  <li>Common rooms with TV and indoor games</li>
                  <li>Laundry services</li>
                  <li>24-hour security with CCTV surveillance</li>
                  <li>Power backup</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Room Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800">Single Occupancy</h4>
                    <p className="text-gray-600">₹12,000/month</p>
                    <p className="text-sm text-gray-500 mt-1">Includes all amenities</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800">Double Sharing</h4>
                    <p className="text-gray-600">₹8,000/month</p>
                    <p className="text-sm text-gray-500 mt-1">Includes all amenities</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800">Triple Sharing</h4>
                    <p className="text-gray-600">₹6,000/month</p>
                    <p className="text-sm text-gray-500 mt-1">Includes all amenities</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800">AC Rooms</h4>
                    <p className="text-gray-600">Additional ₹2,000/month</p>
                    <p className="text-sm text-gray-500 mt-1">Available for all room types</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Location</h3>
                <p className="text-gray-700">
                  Aanand Hostel is conveniently located just 1 km from the main city center,
                  with easy access to public transportation, shopping malls, restaurants,
                  and educational institutions.
                </p>
                <div className="mt-3">
                  <p className="font-medium text-gray-800">Address:</p>
                  <p className="text-gray-700">
                    123, University Road, Anand Nagar,<br />
                    Pune, Maharashtra - 411007
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Rules & Regulations</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Strict adherence to entry/exit timings</li>
                  <li>No smoking or alcohol consumption allowed</li>
                  <li>Visitors allowed only in common areas</li>
                  <li>Maintain cleanliness and hygiene</li>
                  <li>Respect other residents' privacy and space</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={toggleContactModal}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                I'm Interested — Contact Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
