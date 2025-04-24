import { useEffect, useState } from "react";
import { Bell, Plus, Eye } from "lucide-react";
import supabase from "../supabaseClient";

const Announcements = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setAnnouncements(data);
    } else {
      console.error("Error fetching announcements:", error);
    }
    setIsLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("announcements").insert([
      {
        title,
        message,
      },
    ]);

    if (!error) {
      setTitle("");
      setMessage("");
      setActiveTab("view");
      fetchAnnouncements();
    } else {
      console.error("Error creating announcement:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
        <h1 className="text-white text-xl font-semibold flex items-center">
          <Bell className="mr-2" size={20} /> Announcements
        </h1>
      </div>

      <div className="p-6">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center transition-all ${
              activeTab === "view"
                ? "bg-white shadow-sm text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("view")}
          >
            <Eye size={18} className="mr-2" /> View Announcements
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center transition-all ${
              activeTab === "create"
                ? "bg-white shadow-sm text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("create")}
          >
            <Plus size={18} className="mr-2" /> Create Announcement
          </button>
        </div>

        {activeTab === "view" && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No announcements yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {announcements.map((a) => (
                  <li
                    key={a.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h2 className="text-lg font-bold text-gray-800">
                      {a.title}
                    </h2>
                    <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                      {a.message}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-gray-400">
                      <span>{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Announcement Title
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear title"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Announcement Content
              </label>
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement details..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <Plus size={18} className="mr-2" /> Post Announcement
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Announcements;
