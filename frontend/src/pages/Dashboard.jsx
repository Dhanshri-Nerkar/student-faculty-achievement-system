import StudentPanel from "../components/StudentPanel";
import FacultyPanel from "../components/FacultyPanel";
import AdminPanel from "../components/AdminPanel";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: "15px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
          }}>
            🎓
          </div>
          <div>
            <h1 style={{ fontSize: "20px", margin: 0, color: "#2d3748" }}>
              Student Faculty Achievement System
            </h1>
            <p style={{ fontSize: "12px", margin: 0, color: "#718096" }}>
              {user?.role?.toUpperCase()} Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "14px", margin: 0, color: "#4a5568", fontWeight: "500" }}>
              {formatDate()}
            </p>
            <p style={{ fontSize: "18px", margin: 0, color: "#667eea", fontWeight: "bold" }}>
              {formatTime()}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #f56565, #c53030)",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "20px 5%", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Role-specific Panel */}
        {user?.role === "student" && <StudentPanel />}
        {user?.role === "faculty" && <FacultyPanel />}
        {user?.role === "admin" && <AdminPanel />}
      </main>
    </div>
  );
};

export default Dashboard;