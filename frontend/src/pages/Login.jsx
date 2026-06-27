import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const { role } = useParams(); // student / faculty / admin
  const navigate = useNavigate();

  const [form, setForm] = useState({
    prn: "",
    empId: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

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

  const validateForm = () => {
    const newErrors = {};
    
    if (role === "student" && !form.prn.trim()) {
      newErrors.prn = "PRN is required";
    }
    if (role === "faculty" && !form.empId.trim()) {
      newErrors.empId = "Employee ID is required";
    }
    if (role === "admin") {
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const getPlaceholder = () => {
    switch(role) {
      case "student": return "Enter your PRN Number";
      case "faculty": return "Enter your Employee ID";
      case "admin": return "Enter your email address";
      default: return "";
    }
  };

  const getIdentifierLabel = () => {
    switch(role) {
      case "student": return "PRN Number";
      case "faculty": return "Employee ID";
      case "admin": return "Email Address";
      default: return "";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const loginData = {
        password: form.password,
        role,
      };

      if (role === "student") loginData.prn = form.prn;
      if (role === "faculty") loginData.empId = form.empId;
      if (role === "admin") loginData.email = form.email;

      const res = await API.post("/auth/login", loginData);

      localStorage.setItem("token", res.data.token);
      // Save to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: res.data.token,
          email: res.data.email,
          role: res.data.role,
          name: res.data.name,
        })
      );

      // Handle remember me
      if (rememberMe && role === "admin") {
        localStorage.setItem("rememberedEmail", form.email);
      } else if (!rememberMe) {
        localStorage.removeItem("rememberedEmail");
      }

      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "12px 16px",
    marginBottom: "8px",
    border: hasError ? "2px solid #f56565" : "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#f8f9fa",
  });

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#2d3748",
    fontSize: "14px",
  };

  const roleConfig = {
    student: {
      title: "Student Login",
      icon: "👨‍🎓",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "#667eea",
    },
    faculty: {
      title: "Faculty Login",
      icon: "👩‍🏫",
      gradient: "linear-gradient(135deg, #48bb78, #38a169)",
      color: "#48bb78",
    },
    admin: {
      title: "Admin Login",
      icon: "🛠️",
      gradient: "linear-gradient(135deg, #ed8936, #dd6b20)",
      color: "#ed8936",
    },
  };

  const config = roleConfig[role] || roleConfig.student;

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/")}>
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
      <main style={{ flex: 1, padding: "40px 5%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            maxWidth: "450px",
            width: "100%",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            overflow: "hidden",
            animation: "fadeInUp 0.6s ease-out",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: config.gradient,
              padding: "30px",
              textAlign: "center",
              color: "white",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "35px",
                margin: "0 auto 15px",
              }}
            >
              {config.icon}
            </div>
            <h2 style={{ margin: 0, fontSize: "28px" }}>
              {config.title}
            </h2>
            <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "14px" }}>
              Welcome back! Please enter your credentials
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} style={{ padding: "30px" }}>
            {/* Role-specific identifier field */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>{getIdentifierLabel()} *</label>
              {role === "admin" ? (
                <input
                  type="email"
                  placeholder={getPlaceholder()}
                  style={inputStyle(errors.email)}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setErrors({ ...errors, email: "" })}
                />
              ) : (
                <input
                  type="text"
                  placeholder={getPlaceholder()}
                  style={inputStyle(role === "student" ? errors.prn : errors.empId)}
                  value={role === "student" ? form.prn : form.empId}
                  onChange={(e) => {
                    if (role === "student") {
                      setForm({ ...form, prn: e.target.value });
                    } else {
                      setForm({ ...form, empId: e.target.value });
                    }
                  }}
                  onFocus={() => {
                    if (role === "student") {
                      setErrors({ ...errors, prn: "" });
                    } else {
                      setErrors({ ...errors, empId: "" });
                    }
                  }}
                />
              )}
              {role === "student" && errors.prn && (
                <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.prn}</p>
              )}
              {role === "faculty" && errors.empId && (
                <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.empId}</p>
              )}
              {role === "admin" && errors.email && (
                <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  style={inputStyle(errors.password)}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setErrors({ ...errors, password: "" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
              {errors.password && <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", color: "#4a5568" }}>Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset link will be sent to your email");
                }}
                style={{
                  fontSize: "13px",
                  color: config.color,
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: config.gradient,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 20px ${config.color}66`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Register Link */}
            {(role === "student" || role === "faculty") && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <p style={{ color: "#718096", fontSize: "14px" }}>
                  Don't have an account?{" "}
                  <span
                    onClick={() => navigate(`/register/${role}`)}
                    style={{
                      color: config.color,
                      cursor: "pointer",
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                  >
                    Register here
                  </span>
                </p>
              </div>
            )}

            {/* Back to Home */}
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <span
                onClick={() => navigate("/")}
                style={{
                  color: "#718096",
                  cursor: "pointer",
                  fontSize: "13px",
                  textDecoration: "underline",
                }}
              >
                ← Back to Home
              </span>
            </div>
          </form>
        </div>
      </main>

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
        `}
      </style>
    </div>
  );
};

export default Login;