import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Overview from "./warden/Overview";
import Students from "./warden/Students";
import Rooms from "./warden/Rooms";
import Complaints from "./warden/Complaints";
import Announcements from "./warden/Announcements";
import Login from "./student/auth/login";
import Signup from "./student/auth/signup";
import StudentDashboard from "./student/StudentDashboard";
import Navbar from "./component/Navbar";
function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="students" element={<Students />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
