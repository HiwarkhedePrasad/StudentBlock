const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Welcome to <span className="text-blue-600">Aanand Hostel</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Your second home with comfort, community, and convenience.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition">
            Book a Room
          </button>
          <button className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl shadow-md hover:bg-blue-100 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
