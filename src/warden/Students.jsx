import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Users,
  Home,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
} from "lucide-react";
import supabase from "../supabaseClient";

const Students = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New student form state
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    year_of_study: "",
    gender: "",
  });

  // Room assignment state
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select(
        "*, room:rooms(id, room_number, building, capacity, current_occupancy)"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setStudents(data);
    } else {
      console.error("Error fetching students:", error);
    }
    setIsLoading(false);
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .lt("current_occupancy", "capacity") // Only rooms with available space
      .order("building", { ascending: true })
      .order("room_number", { ascending: true });

    if (!error) {
      setRooms(data);
    } else {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          ...newStudent,
          status: "pending", // New students start with pending status
          room_id: null, // No room assigned initially
        },
      ])
      .select();

    if (!error) {
      setNewStudent({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department: "",
        year_of_study: "",
        gender: "",
      });
      setShowAddForm(false);
      fetchStudents();
    } else {
      console.error("Error adding student:", error);
    }
  };

  const handleApproveStudent = async (studentId) => {
    const { error } = await supabase
      .from("students")
      .update({ status: "approved" })
      .eq("id", studentId);

    if (!error) {
      fetchStudents();
    } else {
      console.error("Error approving student:", error);
    }
  };

  const handleRejectStudent = async (studentId) => {
    const { error } = await supabase
      .from("students")
      .update({ status: "rejected" })
      .eq("id", studentId);

    if (!error) {
      fetchStudents();
    } else {
      console.error("Error rejecting student:", error);
    }
  };

  const handleAssignRoom = async (e) => {
    e.preventDefault();

    // Start transaction to update both student and room
    const { error: studentError } = await supabase
      .from("students")
      .update({ room_id: selectedRoomId })
      .eq("id", selectedStudentId);

    if (studentError) {
      console.error("Error assigning room to student:", studentError);
      return;
    }

    // Get current room data
    const { data: roomData } = await supabase
      .from("rooms")
      .select("current_occupancy")
      .eq("id", selectedRoomId)
      .single();

    // Update room occupancy
    const { error: roomError } = await supabase
      .from("rooms")
      .update({ current_occupancy: roomData.current_occupancy + 1 })
      .eq("id", selectedRoomId);

    if (!roomError) {
      setIsAssigningRoom(false);
      setSelectedRoomId("");
      setSelectedStudentId(null);
      fetchStudents();
      fetchRooms();
    } else {
      console.error("Error updating room occupancy:", roomError);
    }
  };

  const openRoomAssignment = (studentId) => {
    setSelectedStudentId(studentId);
    setIsAssigningRoom(true);
  };

  const filteredStudents = students.filter((student) => {
    // Filter by tab selection
    const statusMatch =
      (activeTab === "pending" && student.status === "pending") ||
      (activeTab === "approved" && student.status === "approved") ||
      (activeTab === "rejected" && student.status === "rejected") ||
      activeTab === "all";

    // Filter by search term
    const searchMatch =
      searchTerm === "" ||
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Student Management
            </h1>
            <p className="text-blue-100 mt-1">
              Approve applications and assign accommodation
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-50 transition-colors"
            >
              <UserPlus size={18} className="mr-2" />
              Add New Student
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b overflow-x-auto no-scrollbar">
        <button
          className={`px-6 py-3 font-medium transition-colors flex items-center ${
            activeTab === "pending"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          <Filter size={16} className="mr-2" />
          Pending
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors flex items-center ${
            activeTab === "approved"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("approved")}
        >
          <CheckCircle size={16} className="mr-2" />
          Approved
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors flex items-center ${
            activeTab === "rejected"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          <XCircle size={16} className="mr-2" />
          Rejected
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors flex items-center ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("all")}
        >
          <Users size={16} className="mr-2" />
          All Students
        </button>
      </div>

      {/* Search and refresh tools */}
      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center">
        <div className="relative w-full sm:w-96 mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchStudents}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Content area */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">
              No {activeTab !== "all" ? activeTab : ""} students found
            </p>
            <p className="text-gray-400 mt-1">
              {searchTerm
                ? "Try a different search term"
                : "Students will appear here once added"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Year {student.year_of_study}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.room ? (
                        <div className="flex items-center">
                          <Home size={16} className="text-green-500 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {student.room.building} -{" "}
                              {student.room.room_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.room.current_occupancy}/
                              {student.room.capacity} occupied
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.status === "pending" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {student.status === "approved" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      )}
                      {student.status === "rejected" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {student.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveStudent(student.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectStudent(student.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Modified this line to show the button for any approved student without a room */}
                        {student.status === "approved" && !student.room && (
                          <button
                            onClick={() => openRoomAssignment(student.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Assign Room
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add new student modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Student
              </h2>
            </div>

            <form onSubmit={handleAddStudent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.first_name}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        first_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.last_name}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.phone}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.department}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        department: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.year_of_study}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        year_of_study: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                    <option value="5">Fifth Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newStudent.gender}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, gender: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room assignment modal */}
      {isAssigningRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Assign Room
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a room to assign to this student
              </p>
            </div>

            <form onSubmit={handleAssignRoom} className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Rooms
                </label>
                {rooms.length === 0 ? (
                  <div className="text-sm text-red-500 mb-4">
                    No rooms available. Add more rooms or check occupancy
                    levels.
                  </div>
                ) : (
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    required
                  >
                    <option value="">Select a Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.building} - Room {room.room_number} (
                        {room.current_occupancy}/{room.capacity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setIsAssigningRoom(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!selectedRoomId || rooms.length === 0}
                >
                  Assign Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
