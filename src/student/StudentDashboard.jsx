import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [complaint, setComplaint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAndProfileData();
    fetchAnnouncements();
  }, []);

  const fetchUserAndProfileData = async () => {
    try {
      // Get current authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        navigate("/login");
        return;
      }

      setUserData(user);

      // Get student profile data using the student_id from user_metadata
      if (user.user_metadata && user.user_metadata.student_id) {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", user.user_metadata.student_id)
          .single();

        if (error) {
          console.error("Error fetching student profile:", error.message);
          // Continue even if profile fetch fails - we'll show what we have
        } else {
          setStudentProfile(data);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setError("Failed to load your profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error.message);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!complaint.trim()) return;
    console.log({
      complaint,
      student_id: userData?.user_metadata?.student_id,
      user_id: userData?.id,
      email: userData?.email,
    });
    
    setSubmitting(true);

    try {
      const { error } = await supabase.from("complaints").insert([
        {
          content: complaint,
          student_id: userData.user_metadata.student_id,
          user_id: userData.id,
          email: userData.email,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setComplaint("");
      alert("Your complaint has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting complaint:", error.message);
      alert("Failed to submit your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  const firstName =
    studentProfile?.first_name || userData?.email?.split("@")[0] || "Student";
  const lastName = studentProfile?.last_name || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container px-4 py-4 mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">Hello, {firstName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 mx-auto">
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Student Profile Card */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl text-blue-600">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-center mb-6">
              Your Information
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-right break-all">{userData?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-600">Student ID:</span>
                <span>{userData?.user_metadata?.student_id || "Not Set"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-600">Room Number:</span>
                <span>{studentProfile?.room_number || "Not Assigned"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-600">Floor:</span>
                <span>{studentProfile?.floor || "Not Assigned"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-600">Hostel Block:</span>
                <span>{studentProfile?.hostel_block || "Not Assigned"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-600">Last Login:</span>
                <span>
                  {new Date(userData?.last_sign_in_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Status:</span>
                <span
                  className={`py-1 px-2 rounded-full text-xs ${
                    studentProfile?.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {studentProfile?.status || "Pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Announcements Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">📢</span> Announcements
              </h2>

              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded"
                    >
                      <div className="font-medium text-blue-800">
                        {announcement.title}
                      </div>
                      <div className="mt-2 text-gray-700">
                        {announcement.content}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
                    No announcements at this time.
                  </div>
                )}
              </div>
            </div>

            {/* Complaint Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">📝</span> File a Complaint
              </h2>

              <form onSubmit={submitComplaint}>
                <div className="mb-4">
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
