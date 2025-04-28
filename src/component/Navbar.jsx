const Navbar = () => {
    return (
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        {/* Logo / Title */}
        <div className="text-2xl font-bold">
          Aanand Hostel
        </div>
  
        {/* Navigation Links + Login Button */}
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Rooms</a>
          <a href="#" className="hover:underline">Facilities</a>
          <a href="#" className="hover:underline">Contact</a>
  
          {/* Login Button */}
          <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100">
            Login
          </button>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  