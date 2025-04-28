import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient"; // adjust your path

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // New Supabase way: use getUser() (async)
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };

    fetchUser();

    // Also listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          Aanand Hostel
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:underline">Home</Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="font-semibold">
                Hello, {user.user_metadata?.name || user.email || "User"}!
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-blue-500">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="hover:bg-blue-700 py-2 px-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {user ? (
              <div className="flex flex-col space-y-3">
                <span className="font-semibold">
                  Hello, {user.user_metadata?.name || user.email || "User"}!
                </span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setIsMenuOpen(false);
                  }}
                  className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 w-full text-center"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full"
              >
                <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 w-full">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;