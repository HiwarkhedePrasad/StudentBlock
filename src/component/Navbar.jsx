import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import  supabase  from "../supabaseClient"; // adjust your path

const Navbar = () => {
  const [user, setUser] = useState(null);

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

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold">
        Aanand Hostel
      </div>

      {/* Links */}
      <div className="flex items-center space-x-6">
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
    </nav>
  );
};

export default Navbar;
