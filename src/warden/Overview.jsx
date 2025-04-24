import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Home,
  AlertTriangle,
  Bell,
  UserPlus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import supabase from "../supabaseClient";
const Overview = () => {
  // Stats state
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsWithoutRooms: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    emptyRooms: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    recentAnnouncements: 0,
  });

  // Building occupancy data state
  const [buildingData, setBuildingData] = useState([]);

  // Floor occupancy data state
  const [floorData, setFloorData] = useState([]);

  // Recent complaints state
  const [recentComplaints, setRecentComplaints] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Gender distribution data
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);

  // Room type distribution
  const [roomTypeData, setRoomTypeData] = useState([]);

  // COLORS for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data in parallel
      const [studentsData, roomsData, complaintsData, announcementsData] =
        await Promise.all([
          supabase.from("students").select("*"),
          supabase.from("rooms").select("*"),
          supabase.from("complaints").select("*"),
          supabase.from("announcements").select("*"),
        ]);

      if (studentsData.error) throw studentsData.error;
      if (roomsData.error) throw roomsData.error;
      if (complaintsData.error) throw complaintsData.error;
      if (announcementsData.error) throw announcementsData.error;

      const students = studentsData.data || [];
      const rooms = roomsData.data || [];
      const complaints = complaintsData.data || [];
      const announcements = announcementsData.data || [];

      // Calculate stats
      const studentsWithoutRoom = students.filter((s) => !s.room_id).length;
      const occupiedRooms = rooms.filter((r) => r.current_occupancy > 0).length;
      const emptyRooms = rooms.filter((r) => r.current_occupancy === 0).length;
      const pendingComplaints = complaints.filter(
        (c) => c.status === "pending"
      ).length;
      const resolvedComplaints = complaints.filter(
        (c) => c.status === "resolved"
      ).length;

      // Calculate gender distribution
      const maleStudents = students.filter((s) => s.gender === "male").length;
      const femaleStudents = students.filter(
        (s) => s.gender === "female"
      ).length;

      // Set gender data
      setGenderData([
        { name: "Male", value: maleStudents },
        { name: "Female", value: femaleStudents },
      ]);

      // Calculate room type distribution
      const roomTypes = {};
      rooms.forEach((room) => {
        if (!roomTypes[room.room_type]) {
          roomTypes[room.room_type] = 0;
        }
        roomTypes[room.room_type]++;
      });

      const roomTypeChartData = Object.keys(roomTypes).map((type) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: roomTypes[type],
      }));

      setRoomTypeData(roomTypeChartData);

      // Calculate building occupancy
      const buildings = {};
      rooms.forEach((room) => {
        if (!buildings[room.building]) {
          buildings[room.building] = {
            building: room.building,
            total: 0,
            occupied: 0,
            capacity: 0,
          };
        }

        buildings[room.building].total++;
        buildings[room.building].occupied += room.current_occupancy;
        buildings[room.building].capacity += room.capacity;
      });

      const buildingChartData = Object.values(buildings).map((b) => ({
        name: b.building,
        occupancy: b.occupied,
        capacity: b.capacity,
        occupancyRate: Math.round((b.occupied / b.capacity) * 100),
      }));

      setBuildingData(buildingChartData);

      // Calculate floor occupancy
      const floors = {};
      rooms.forEach((room) => {
        const floorKey = `${room.building}-${room.floor}`;
        if (!floors[floorKey]) {
          floors[floorKey] = {
            name: `${room.building} - Floor ${room.floor}`,
            total: 0,
            occupied: 0,
            capacity: 0,
          };
        }

        floors[floorKey].total++;
        floors[floorKey].occupied += room.current_occupancy;
        floors[floorKey].capacity += room.capacity;
      });

      const floorChartData = Object.values(floors)
        .map((f) => ({
          name: f.name,
          occupancy: f.occupied,
          capacity: f.capacity,
          occupancyRate: Math.round((f.occupied / f.capacity) * 100),
        }))
        .sort((a, b) => b.occupancyRate - a.occupancyRate)
        .slice(0, 5); // Top 5 floors by occupancy rate

      setFloorData(floorChartData);

      // Get recent complaints
      const sortedComplaints = complaints
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentComplaints(sortedComplaints);

      // Update stats
      setStats({
        totalStudents: students.length,
        studentsWithoutRooms: studentsWithoutRoom,
        totalRooms: rooms.length,
        occupiedRooms,
        emptyRooms,
        pendingComplaints,
        resolvedComplaints,
        recentAnnouncements: announcements.length,
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format percentage for labels
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Hostel Overview Dashboard
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.totalStudents}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="text-xs text-red-600 flex items-center mr-1">
                    <span>{stats.studentsWithoutRooms}</span>
                  </span>
                  <span>students without room</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Room Occupancy
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.occupiedRooms}/{stats.totalRooms}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Home size={24} className="text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="text-xs text-green-600 flex items-center mr-1">
                    <ArrowUp size={12} />
                    <span>
                      {Math.round(
                        (stats.occupiedRooms / stats.totalRooms) * 100
                      )}
                      %
                    </span>
                  </span>
                  <span>occupancy rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Complaints
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.pendingComplaints + stats.resolvedComplaints}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertTriangle size={24} className="text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="text-xs text-red-600 flex items-center mr-1">
                    <span>{stats.pendingComplaints}</span>
                  </span>
                  <span>pending resolution</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Announcements
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.recentAnnouncements}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Bell size={24} className="text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <span>total announcements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Building Occupancy</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={buildingData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="occupancy"
                      name="Current Occupancy"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="capacity"
                      name="Total Capacity"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                Top 5 Floors by Occupancy Rate
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={floorData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Occupancy Rate"]}
                    />
                    <Legend />
                    <Bar
                      dataKey="occupancyRate"
                      name="Occupancy Rate"
                      fill="#FF8042"
                      unit="%"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Student & Room Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                Gender Distribution
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Students"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                Room Type Distribution
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roomTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Rooms"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Complaints</h2>
              <Link
                to="/complaints"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {recentComplaints.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No recent complaints
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {complaint.student_name || "Unknown Student"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {complaint.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              complaint.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
