import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const { role } = useParams(); // student / faculty
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    prn: "",
    empId: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (role === "student" && !form.prn.trim()) newErrors.prn = "PRN is required";
    if (role === "faculty" && !form.empId.trim()) newErrors.empId = "Employee ID is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!form.otp) newErrors.otp = "OTP is required";
    return newErrors;
  };

  const handleSendOtp = async () => {
    if (!form.email) {
      setErrors({ email: "Please enter email first" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErrors({ email: "Please enter a valid email" });
      return;
    }

    setIsLoading(true);
    try {
      await API.post("/auth/send-otp", { email: form.email });
      setOtpSent(true);
      setCountdown(60);
      setErrors({});
      alert("OTP sent to your email");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        prn: role === "student" ? form.prn : undefined,
        empId: role === "faculty" ? form.empId : undefined,
        password: form.password,
        otp: form.otp,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Registered successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Registration failed");
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
            maxWidth: "500px",
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
              background: "linear-gradient(135deg, #667eea, #764ba2)",
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
              {role === "student" ? "👨‍🎓" : "👩‍🏫"}
            </div>
            <h2 style={{ margin: 0, fontSize: "28px" }}>
              {role === "student" ? "Student Registration" : "Faculty Registration"}
            </h2>
            <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "14px" }}>
              Create your account to get started
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleRegister} style={{ padding: "30px" }}>
            {/* Name */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                style={inputStyle(errors.name)}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={() => setErrors({ ...errors, name: "" })}
              />
              {errors.name && <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                placeholder="you@example.com"
                style={inputStyle(errors.email)}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setErrors({ ...errors, email: "" })}
              />
              {errors.email && <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.email}</p>}
            </div>

            {/* Student PRN */}
            {role === "student" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>PRN (Permanent Registration Number) *</label>
                <input
                  type="text"
                  placeholder="Enter your PRN"
                  style={inputStyle(errors.prn)}
                  value={form.prn}
                  onChange={(e) => setForm({ ...form, prn: e.target.value })}
                  onFocus={() => setErrors({ ...errors, prn: "" })}
                />
                {errors.prn && <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.prn}</p>}
              </div>
            )}

            {/* Faculty Employee ID */}
            {role === "faculty" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Employee ID *</label>
                <input
                  type="text"
                  placeholder="Enter your Employee ID"
                  style={inputStyle(errors.empId)}
                  value={form.empId}
                  onChange={(e) => setForm({ ...form, empId: e.target.value })}
                  onFocus={() => setErrors({ ...errors, empId: "" })}
                />
                {errors.empId && <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.empId}</p>}
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
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

            {/* Confirm Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Confirm Password *</label>
              <input
                type="password"
                placeholder="Confirm your password"
                style={inputStyle(errors.confirmPassword)}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                onFocus={() => setErrors({ ...errors, confirmPassword: "" })}
              />
              {errors.confirmPassword && <p style={{ color: "#f56565", fontSize: "12px", margin: "0 0 8px" }}>{errors.confirmPassword}</p>}
            </div>

            {/* OTP Section */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>OTP Verification *</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  style={{ ...inputStyle(errors.otp), marginBottom: 0 }}
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  onFocus={() => setErrors({ ...errors, otp: "" })}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || countdown > 0}
                  style={{
                    padding: "12px 20px",
                    background: countdown > 0 ? "#cbd5e0" : "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: countdown > 0 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s ease",
                  }}
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
              {errors.otp && <p style={{ color: "#f56565", fontSize: "12px", margin: "8px 0 0" }}>{errors.otp}</p>}
              {otpSent && !errors.otp && (
                <p style={{ color: "#48bb78", fontSize: "12px", margin: "8px 0 0" }}>
                  ✓ OTP sent to {form.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
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
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isLoading ? "Processing..." : "Register Account"}
            </button>

            {/* Login Link */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <p style={{ color: "#718096", fontSize: "14px" }}>
                Already have an account?{" "}
                <span
                  onClick={() => navigate(`/login/${role}`)}
                  style={{
                    color: "#667eea",
                    cursor: "pointer",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  Login here
                </span>
              </p>
            </div>

            {/* Back to Home Link */}
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <span
                onClick={() => navigate("/")}
                style={{
                  color: "#718096",
                  cursor: "pointer",
                  fontSize: "13px",
                  textDecoration: "underline",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
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

export default Register;