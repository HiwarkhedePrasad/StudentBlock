import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

// Main Room Management Component
const Rooms = () => {
  // State for managing data
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("roomView");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // New room form state
  const [newRoom, setNewRoom] = useState({
    building: "",
    room_number: "",
    floor: 1,
    capacity: 2,
    room_type: "standard",
    gender_restriction: "",
    is_accessible: false,
    notes: "",
  });

  // Student assignment form state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);

  // Floor options for filtering and forms
  const floorOptions = [1, 2, 3, 4, 5];

  // Room types for forms
  const roomTypes = ["standard", "deluxe", "premium", "suite"];

  // Gender restriction options
  const genderOptions = ["", "male", "female"];

  // Load initial data
  useEffect(() => {
    fetchBuildings();
    fetchRooms();
    fetchStudents();
  }, []);

  // Filter rooms when building or floor selection changes
  useEffect(() => {
    fetchRooms();
  }, [selectedBuilding, selectedFloor]);

  // Fetch unique buildings from rooms table
  const fetchBuildings = async () => {
    try {
      // Alternative approach since distinct() isn't available
      const { data, error } = await supabase.from("rooms").select("building");

      if (error) throw error;

      // Manually filter for unique building names
      const uniqueBuildings = [...new Set(data.map((item) => item.building))];
      setBuildings(uniqueBuildings);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setError("Failed to load buildings");
    }
  };

  // Fetch rooms with filters
  const fetchRooms = async () => {
    setLoading(true);
    try {
      let query = supabase.from("rooms").select(`
        id, 
        building, 
        room_number, 
        floor, 
        capacity, 
        current_occupancy, 
        room_type, 
        gender_restriction, 
        is_accessible, 
        notes,
        students (id, first_name, last_name)
      `);

      // Apply filters if set
      if (selectedBuilding) {
        query = query.eq("building", selectedBuilding);
      }

      if (selectedFloor) {
        query = query.eq("floor", selectedFloor);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students without room assignment
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, gender, status")
        .is("room_id", null)
        .eq("status", "approved");

      if (error) throw error;

      setAvailableStudents(data || []);

      // Also get all students for reference
      const { data: allStudents, error: allStudentsError } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, gender, status, room_id");

      if (allStudentsError) throw allStudentsError;

      setStudents(allStudents || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
    }
  };

  // Add new room
  const handleAddRoom = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([newRoom])
        .select();

      if (error) throw error;

      // Reset form and refresh rooms
      setNewRoom({
        building: "",
        room_number: "",
        floor: 1,
        capacity: 2,
        room_type: "standard",
        gender_restriction: "",
        is_accessible: false,
        notes: "",
      });

      fetchRooms();
      fetchBuildings();
      setActiveTab("roomView");
    } catch (error) {
      console.error("Error adding room:", error);
      setError("Failed to add room");
    }
  };

  // Update existing room
  const handleUpdateRoom = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("rooms")
        .update(newRoom)
        .eq("id", selectedRoom.id);

      if (error) throw error;

      // Reset form and refresh rooms
      setNewRoom({
        building: "",
        room_number: "",
        floor: 1,
        capacity: 2,
        room_type: "standard",
        gender_restriction: "",
        is_accessible: false,
        notes: "",
      });

      setIsEditing(false);
      setSelectedRoom(null);
      fetchRooms();
      setActiveTab("roomView");
    } catch (error) {
      console.error("Error updating room:", error);
      setError("Failed to update room");
    }
  };

  // Assign student to room
  const handleAssignStudent = async (e) => {
    e.preventDefault();

    try {
      // Start a transaction manually since RPC isn't available
      // 1. Update student record
      const { error: studentError } = await supabase
        .from("students")
        .update({ room_id: selectedRoom.id })
        .eq("id", selectedStudent);

      if (studentError) throw studentError;

      // 2. Update room occupancy count
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          current_occupancy: selectedRoom.current_occupancy + 1,
        })
        .eq("id", selectedRoom.id);

      if (roomError) throw roomError;

      // Refresh data
      fetchRooms();
      fetchStudents();
      setSelectedStudent(null);
      setSelectedRoom(null);
      setActiveTab("roomView");
    } catch (error) {
      console.error("Error assigning student:", error);
      setError("Failed to assign student to room");
    }
  };

  // Remove student from room
  const handleRemoveStudent = async (studentId, roomId) => {
    try {
      // Start a transaction manually
      // 1. Find the room to update
      const roomToUpdate = rooms.find((r) => r.id === roomId);
      if (!roomToUpdate) throw new Error("Room not found");

      // 2. Update student record
      const { error: studentError } = await supabase
        .from("students")
        .update({ room_id: null })
        .eq("id", studentId);

      if (studentError) throw studentError;

      // 3. Update room occupancy count
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          current_occupancy: Math.max(0, roomToUpdate.current_occupancy - 1),
        })
        .eq("id", roomId);

      if (roomError) throw roomError;

      // Refresh data
      fetchRooms();
      fetchStudents();
    } catch (error) {
      console.error("Error removing student:", error);
      setError("Failed to remove student from room");
    }
  };
  // Edit room handler
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setNewRoom({
      building: room.building,
      room_number: room.room_number,
      floor: room.floor,
      capacity: room.capacity,
      room_type: room.room_type,
      gender_restriction: room.gender_restriction,
      is_accessible: room.is_accessible,
      notes: room.notes,
    });
    setIsEditing(true);
    setActiveTab("addRoom");
  };

  // Delete room handler
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      // Check if room has students
      const roomToDelete = rooms.find((r) => r.id === roomId);
      if (
        roomToDelete &&
        roomToDelete.students &&
        roomToDelete.students.length > 0
      ) {
        alert(
          "Cannot delete room with assigned students. Please remove students first."
        );
        return;
      }

      const { error } = await supabase.from("rooms").delete().eq("id", roomId);

      if (error) throw error;

      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("Failed to delete room");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-6">
            <h1 className="text-3xl font-bold text-white">
              Room Management System
            </h1>
            <p className="text-blue-100 mt-2">
              Manage hostel rooms and student allocations
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("roomView")}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === "roomView"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Room View
              </button>
              <button
                onClick={() => {
                  setActiveTab("addRoom");
                  setIsEditing(false);
                  setNewRoom({
                    building: "",
                    room_number: "",
                    floor: 1,
                    capacity: 2,
                    room_type: "standard",
                    gender_restriction: "",
                    is_accessible: false,
                    notes: "",
                  });
                }}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === "addRoom"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {isEditing ? "Edit Room" : "Add Room"}
              </button>
              <button
                onClick={() => setActiveTab("floorPlan")}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === "floorPlan"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Floor Plan
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
                <button
                  className="float-right font-bold"
                  onClick={() => setError(null)}
                >
                  &times;
                </button>
              </div>
            )}

            {/* Room View Tab */}
            {activeTab === "roomView" && (
              <div>
                {/* Filter Controls */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building
                    </label>
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                    >
                      <option value="">All Buildings</option>
                      {buildings.map((building, index) => (
                        <option key={index} value={building}>
                          {building}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor
                    </label>
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={selectedFloor}
                      onChange={(e) =>
                        setSelectedFloor(
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                    >
                      <option value="">All Floors</option>
                      {floorOptions.map((floor) => (
                        <option key={floor} value={floor}>
                          Floor {floor}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedBuilding("");
                        setSelectedFloor("");
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Rooms Table */}
                {loading ? (
                  <div className="text-center py-10">
                    <div className="spinner"></div>
                    <p className="mt-2 text-gray-600">Loading rooms...</p>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600">
                      No rooms found. Try adjusting your filters or add a new
                      room.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Building
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Floor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Occupancy
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map((room) => (
                          <tr key={room.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {room.building}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {room.room_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {room.floor}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${
                                  room.current_occupancy === room.capacity
                                    ? "bg-red-100 text-red-800"
                                    : room.current_occupancy === 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {room.current_occupancy}/{room.capacity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {room.room_type}
                              {room.gender_restriction &&
                                ` (${room.gender_restriction})`}
                              {room.is_accessible && " ♿"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {room.students && room.students.length > 0 ? (
                                <div>
                                  {room.students.map((student) => (
                                    <div
                                      key={student.id}
                                      className="flex items-center justify-between mb-1"
                                    >
                                      <span>
                                        {student.first_name} {student.last_name}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleRemoveStudent(
                                            student.id,
                                            room.id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900 text-xs"
                                        title="Remove student"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}

                                  {/* Add student button if room has space */}
                                  {room.current_occupancy < room.capacity && (
                                    <button
                                      onClick={() => {
                                        setSelectedRoom(room);
                                        setActiveTab("assignStudent");
                                      }}
                                      className="text-blue-600 hover:text-blue-900 text-xs mt-2"
                                    >
                                      + Add Student
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedRoom(room);
                                    setActiveTab("assignStudent");
                                  }}
                                  className="text-blue-600 hover:text-blue-900 text-xs"
                                >
                                  + Assign Students
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Room Tab */}
            {activeTab === "addRoom" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? "Edit Room" : "Add New Room"}
                </h2>
                <form onSubmit={isEditing ? handleUpdateRoom : handleAddRoom}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building
                      </label>
                      <input
                        type="text"
                        value={newRoom.building}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, building: e.target.value })
                        }
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Block A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={newRoom.room_number}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            room_number: e.target.value,
                          })
                        }
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor
                      </label>
                      <select
                        value={newRoom.floor}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            floor: parseInt(e.target.value),
                          })
                        }
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {floorOptions.map((floor) => (
                          <option key={floor} value={floor}>
                            {floor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newRoom.capacity}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            capacity: parseInt(e.target.value),
                          })
                        }
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type
                      </label>
                      <select
                        value={newRoom.room_type}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, room_type: e.target.value })
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {roomTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender Restriction
                      </label>
                      <select
                        value={newRoom.gender_restriction}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            gender_restriction: e.target.value,
                          })
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No Restriction</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_accessible"
                        checked={newRoom.is_accessible}
                        onChange={(e) =>
                          setNewRoom({
                            ...newRoom,
                            is_accessible: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="is_accessible"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Accessible Room
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={newRoom.notes}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, notes: e.target.value })
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Any additional information about this room"
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("roomView");
                        setIsEditing(false);
                      }}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                    >
                      {isEditing ? "Update Room" : "Add Room"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Assign Student Tab */}
            {activeTab === "assignStudent" && selectedRoom && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Assign Student to Room {selectedRoom.building}{" "}
                  {selectedRoom.room_number}
                </h2>

                {availableStudents.length === 0 ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-yellow-700">
                      No students available for assignment. All approved
                      students have been assigned to rooms or there are no
                      approved students.
                    </p>
                    <button
                      onClick={() => setActiveTab("roomView")}
                      className="mt-2 text-blue-600 hover:text-blue-900"
                    >
                      Return to Room View
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAssignStudent}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Student
                      </label>
                      <select
                        value={selectedStudent || ""}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-- Select Student --</option>
                        {availableStudents.map((student) => (
                          <option
                            key={student.id}
                            value={student.id}
                            disabled={
                              selectedRoom.gender_restriction &&
                              student.gender !== selectedRoom.gender_restriction
                            }
                          >
                            {student.first_name} {student.last_name} (
                            {student.email})
                            {selectedRoom.gender_restriction &&
                            student.gender !== selectedRoom.gender_restriction
                              ? " - Gender restriction applies"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("roomView")}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Assign Student
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Floor Plan Tab */}
            {activeTab === "floorPlan" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Floor Plan View</h2>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building
                    </label>
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      required
                    >
                      <option value="">Select Building</option>
                      {buildings.map((building, index) => (
                        <option key={index} value={building}>
                          {building}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor
                    </label>
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={selectedFloor}
                      onChange={(e) =>
                        setSelectedFloor(
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      required
                    >
                      <option value="">Select Floor</option>
                      {floorOptions.map((floor) => (
                        <option key={floor} value={floor}>
                          Floor {floor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!selectedBuilding || !selectedFloor ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600">
                      Please select both a building and floor to view the floor
                      plan.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-10">
                    <div className="spinner"></div>
                    <p className="mt-2 text-gray-600">Loading floor plan...</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                      <h3 className="text-lg font-medium mb-4">
                        {selectedBuilding} - Floor {selectedFloor}
                      </h3>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {rooms
                          .filter(
                            (room) =>
                              room.building === selectedBuilding &&
                              room.floor === parseInt(selectedFloor)
                          )
                          .sort((a, b) =>
                            a.room_number.localeCompare(
                              b.room_number,
                              undefined,
                              { numeric: true }
                            )
                          )
                          .map((room) => (
                            <div
                              key={room.id}
                              className={`border rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow
                              ${
                                room.current_occupancy === room.capacity
                                  ? "bg-red-50 border-red-200"
                                  : room.current_occupancy === 0
                                  ? "bg-green-50 border-green-200"
                                  : "bg-yellow-50 border-yellow-200"
                              }`}
                              onClick={() => {
                                setSelectedRoom(room);
                                room.current_occupancy < room.capacity
                                  ? setActiveTab("assignStudent")
                                  : handleEditRoom(room);
                              }}
                            >
                              <div className="font-bold">
                                {room.room_number}
                              </div>
                              <div className="text-xs text-gray-600">
                                {room.room_type}
                              </div>
                              <div className="text-sm mt-1">
                                <span className="font-medium">
                                  {room.current_occupancy}/{room.capacity}
                                </span>
                                {room.gender_restriction && (
                                  <span className="ml-1 text-xs">
                                    (
                                    {room.gender_restriction === "male"
                                      ? "M"
                                      : "F"}
                                    )
                                  </span>
                                )}
                                {room.is_accessible && (
                                  <span className="ml-1">♿</span>
                                )}
                              </div>
                              {room.students && room.students.length > 0 && (
                                <div className="text-xs mt-1 text-gray-600 truncate">
                                  {room.students
                                    .map(
                                      (s) =>
                                        `${s.first_name} ${s.last_name.charAt(
                                          0
                                        )}.`
                                    )
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      {rooms.filter(
                        (room) =>
                          room.building === selectedBuilding &&
                          room.floor === parseInt(selectedFloor)
                      ).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-600">
                            No rooms found on this floor.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full mr-1"></div>
                          <span>Empty</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full mr-1"></div>
                          <span>Partially Filled</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full mr-1"></div>
                          <span>Full</span>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => setActiveTab("roomView")}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Return to List View
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component
export default Rooms;
