import { useEffect, useState } from "react";
import API from "../services/api";

const FacultyPanel = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState(null);

  const [form, setForm] = useState({
    name: "",
    empId: "",
    department: "",
    event: "",
    details: "",
    certificate: null,
  });

  // ================= FETCH MY ACHIEVEMENTS =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/achievements/my", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "certificate") {
      setForm({
        ...form,
        certificate: files[0],
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // ================= SUBMIT FORM =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("empId", form.empId);
      formData.append("department", form.department);
      formData.append("event", form.event);
      formData.append("details", form.details);

      if (form.certificate) {
        formData.append("certificate", form.certificate);
      }

      await API.post("/achievements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      alert("✅ Achievement Added Successfully");

      setForm({
        name: "",
        empId: "",
        department: "",
        event: "",
        details: "",
        certificate: null,
      });

      fetchData();
    } catch (err) {
      console.log(err);
      alert("❌ Error adding achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const buttonStyle = (type) => ({
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: hovered === type 
      ? "linear-gradient(135deg, #667eea, #764ba2)" 
      : "#f8f9fa",
    color: hovered === type ? "white" : "#2d3748",
    transform: hovered === type ? "translateY(-2px)" : "translateY(0)",
    boxShadow: hovered === type 
      ? "0 8px 20px rgba(102, 126, 234, 0.3)" 
      : "0 2px 6px rgba(0,0,0,0.08)",
  });

  const inputStyle = {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "#48bb78";
      case "rejected": return "#f56565";
      default: return "#ed8936";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header Stats */}
      <div style={{
        background: "linear-gradient(135deg, #48bb78, #38a169)",
        borderRadius: "20px",
        padding: "30px",
        marginBottom: "30px",
        color: "white",
        boxShadow: "0 10px 40px rgba(72, 187, 120, 0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>👩‍🏫 Faculty Dashboard</h1>
            <p style={{ opacity: 0.9 }}>Welcome back, {user?.name || "Faculty"}!</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold" }}>{data.length}</div>
            <div style={{ opacity: 0.9 }}>Total Achievements</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* ================= FORM SECTION ================= */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          height: "fit-content"
        }}>
          <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "24px" }}>
            📝 Add Faculty Achievement
          </h2>
          
          <form onSubmit={handleSubmit}>
            <h3 style={{ color: "#48bb78", marginBottom: "15px", fontSize: "18px" }}>Basic Details</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#48bb78"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />

              <input
                type="text"
                name="empId"
                placeholder="Employee ID"
                value={form.empId}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#48bb78"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#48bb78"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <h3 style={{ color: "#48bb78", marginBottom: "15px", fontSize: "18px" }}>Achievement Details</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
              <select
                name="event"
                value={form.event}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">Select Event Type</option>
                <option value="International Conference Paper">International Conference Paper</option>
                <option value="International Journal Paper">International Journal Paper</option>
                <option value="FDP">FDP</option>
                <option value="Workshop">Workshop</option>
                <option value="Resource Person">Resource Person</option>
                <option value="Invited Judge">Invited Judge</option>
                <option value="Keynote Speaker">Keynote Speaker</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                name="details"
                placeholder="Details"
                value={form.details}
                onChange={handleChange}
                required
                rows="4"
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={(e) => e.target.style.borderColor = "#48bb78"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />

              <input
                type="file"
                name="certificate"
                onChange={handleChange}
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ ...inputStyle, padding: "8px" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...buttonStyle("submit"),
                width: "100%",
                background: "linear-gradient(135deg, #48bb78, #38a169)",
                color: "white",
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer"
              }}
              onMouseEnter={() => setHovered("submit")}
              onMouseLeave={() => setHovered(null)}
            >
              {submitting ? "⏳ Submitting..." : "✨ Add Achievement"}
            </button>
          </form>
        </div>

        {/* ================= ACHIEVEMENTS LIST ================= */}
        <div>
          <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "24px" }}>
            🏆 My Achievements ({data.length})
          </h2>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "20px" }}>
              <div style={{ fontSize: "40px" }}>⏳</div>
              <p>Loading achievements...</p>
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "20px" }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>🏆</div>
              <h3 style={{ color: "#2d3748" }}>No achievements yet</h3>
              <p style={{ color: "#718096" }}>Start by adding your first achievement!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {data.map((item) => (
                <div
                  key={item._id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    borderLeft: `4px solid ${getStatusColor(item.status)}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <h3 style={{ color: "#2d3748", fontSize: "20px" }}>{item.event}</h3>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      background: `${getStatusColor(item.status)}20`,
                      color: getStatusColor(item.status)
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p><strong>Name:</strong> {item.name}</p>
                  {item.empId && <p><strong>Employee ID:</strong> {item.empId}</p>}
                  {item.department && <p><strong>Department:</strong> {item.department}</p>}
                  {item.details && <p><strong>Details:</strong> {item.details}</p>}
                  
                  {item.certificate && (
                    <p>
                      <a
                        href={item.certificate}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#48bb78", textDecoration: "none", fontWeight: "500" }}
                      >
                        📎 View Certificate
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyPanel;