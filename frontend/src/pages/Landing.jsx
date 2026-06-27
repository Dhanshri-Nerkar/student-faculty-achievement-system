import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buttonStyle = (type) => ({
    padding: "14px 24px",
    margin: "8px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background:
      hovered === type
        ? "linear-gradient(135deg, #667eea, #764ba2)"
        : "#f8f9fa",
    color: hovered === type ? "white" : "#2d3748",
    transform: hovered === type ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
    boxShadow:
      hovered === type
        ? "0 12px 25px rgba(102, 126, 234, 0.3)"
        : "0 2px 8px rgba(0,0,0,0.08)",
    width: "180px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  });

  const featureCards = [
    {
      icon: "🏆",
      title: "Track Achievements",
      description: "Students can log and track their academic and extracurricular achievements",
      color: "#667eea",
    },
    {
      icon: "✅",
      title: "Faculty Approval",
      description: "Faculty members review and approve student submissions",
      color: "#48bb78",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Comprehensive insights and performance metrics",
      color: "#ed8936",
    },
    {
      icon: "🎯",
      title: "Goal Setting",
      description: "Set and achieve personal academic milestones",
      color: "#f56565",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: scrollY > 50 ? "0 4px 20px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.05)",
          padding: "15px 5%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🎓
          </div>
          <div>
            <h1 style={{ fontSize: "20px", margin: 0, color: "#2d3748" }}>
              Student Faculty Achievement System
            </h1>
            <p style={{ fontSize: "12px", margin: 0, color: "#718096" }}>
              Empowering Excellence
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "14px", margin: 0, color: "#4a5568", fontWeight: "500" }}>
            {formatDate()}
          </p>
          <p style={{ fontSize: "18px", margin: 0, color: "#667eea", fontWeight: "bold" }}>
            {formatTime()}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px 5%" }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
            animation: "fadeInUp 0.8s ease-out",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              marginBottom: "15px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🎓 Student Faculty Achievement System
          </h1>
          <p
            style={{
              color: "#4a5568",
              fontSize: "18px",
              marginBottom: "30px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Track • Approve • Showcase Achievements — Your journey to excellence starts here
          </p>
        </div>

        {/* Register and Login Sections Side by Side */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "30px",
            maxWidth: "900px",
            margin: "0 auto 50px auto",
          }}
        >
          {/* Register Section */}
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 25px 45px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #48bb78, #38a169)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                margin: "0 auto 15px",
              }}
            >
              📝
            </div>
            <h2 style={{ color: "#2d3748", marginBottom: "10px" }}>Register</h2>
            <p style={{ color: "#718096", marginBottom: "20px", fontSize: "14px" }}>
              Create your account to get started
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <button
                style={buttonStyle("studentRegister")}
                onMouseEnter={() => setHovered("studentRegister")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/register/student")}
              >
                👨‍🎓 Student Register
              </button>
              <button
                style={buttonStyle("facultyRegister")}
                onMouseEnter={() => setHovered("facultyRegister")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/register/faculty")}
              >
                👩‍🏫 Faculty Register
              </button>
            </div>
          </div>

          {/* Login Section */}
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 25px 45px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                margin: "0 auto 15px",
              }}
            >
              🔐
            </div>
            <h2 style={{ color: "#2d3748", marginBottom: "10px" }}>Login</h2>
            <p style={{ color: "#718096", marginBottom: "20px", fontSize: "14px" }}>
              Welcome back! Login to your account
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <button
                style={buttonStyle("studentLogin")}
                onMouseEnter={() => setHovered("studentLogin")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/login/student")}
              >
                👨‍🎓 Student Login
              </button>
              <button
                style={buttonStyle("facultyLogin")}
                onMouseEnter={() => setHovered("facultyLogin")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/login/faculty")}
              >
                👩‍🏫 Faculty Login
              </button>
              <button
                style={buttonStyle("adminLogin")}
                onMouseEnter={() => setHovered("adminLogin")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/login/admin")}
              >
                🛠️ Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Features Section - 4 cards in one row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginTop: "20px",
          }}
        >
          {featureCards.map((card, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                textAlign: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {card.icon}
              </div>
              <h3 style={{ marginBottom: "10px", color: "#2d3748", fontSize: "18px" }}>
                {card.title}
              </h3>
              <p style={{ color: "#718096", fontSize: "14px", lineHeight: "1.5" }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer
      <footer
        style={{
          background: "#1a202c",
          color: "#a0aec0",
          padding: "40px 5% 20px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "30px",
            marginBottom: "30px",
          }}
        >
          <div>
            <h3 style={{ color: "white", marginBottom: "15px", fontSize: "18px" }}>
              About SFAS
            </h3>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              A comprehensive platform for managing and showcasing student achievements, with faculty approval and administrative oversight.
            </p>
          </div>
          <div>
            <h3 style={{ color: "white", marginBottom: "15px", fontSize: "18px" }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "14px" }}>
              <li style={{ marginBottom: "8px" }}>
                <a href="#" style={{ color: "#a0aec0", textDecoration: "none" }}>About Us</a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a href="#" style={{ color: "#a0aec0", textDecoration: "none" }}>Contact Support</a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a href="#" style={{ color: "#a0aec0", textDecoration: "none" }}>Privacy Policy</a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a href="#" style={{ color: "#a0aec0", textDecoration: "none" }}>Terms of Service</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: "white", marginBottom: "15px", fontSize: "18px" }}>
              Connect With Us
            </h3>
            <div style={{ display: "flex", gap: "15px", fontSize: "24px" }}>
              <span style={{ cursor: "pointer" }}>📘</span>
              <span style={{ cursor: "pointer" }}>🐦</span>
              <span style={{ cursor: "pointer" }}>📷</span>
              <span style={{ cursor: "pointer" }}>💼</span>
            </div>
            <p style={{ fontSize: "14px", marginTop: "15px" }}>
              📧 support@sfas.edu
            </p>
            <p style={{ fontSize: "14px" }}>📞 +1 (555) 123-4567</p>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #2d3748",
            paddingTop: "20px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          <p>© 2024 Student Faculty Achievement System. All rights reserved.</p>
          <p style={{ marginTop: "8px" }}>Empowering students, recognizing excellence.</p>
        </div>
      </footer> */}

      {/* Footer */}
<footer
  style={{
    background: "#1a202c",
    color: "#a0aec0",
    padding: "40px 5% 20px",
    marginTop: "auto",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      textAlign: "center",
      marginBottom: "20px",
    }}
  >
    <div style={{ maxWidth: "600px" }}>
      <h3
        style={{
          color: "white",
          marginBottom: "15px",
          fontSize: "18px",
        }}
      >
        About SFAS
      </h3>
      <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
        A comprehensive platform for managing and showcasing student
        achievements, with faculty approval and administrative oversight.
      </p>
    </div>
  </div>
</footer>

      {/* Scroll to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "transform 0.3s ease",
            zIndex: 999,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ↑
        </button>
      )}

      {/* Responsive Styles */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .feature-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (max-width: 640px) {
            .feature-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Landing;