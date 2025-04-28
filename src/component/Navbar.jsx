import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import  supabase  from "../supabaseClient"; // adjust path if needed

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the currently logged-in user
    const currentUser = supabase.auth.user();
    setUser(currentUser);

    // Optional: Listen to auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup listener when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* Logo / Title */}
      <div className="text-2xl font-bold">
        Aanand Hostel
      </div>

      {/* Navigation Links + User Info or Login Button */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="hover:underline">Home</Link>

        {user ? (
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Hello, {user.user_metadata.name || "User"}!</span>
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
