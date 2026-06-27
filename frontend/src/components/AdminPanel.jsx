import { useEffect, useState } from "react";
import API from "../services/api";

const AdminPanel = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    prn: "",
    empId: "",
    department: "",
    class: "",
    event: "",
    achievementType: "",
    description: "",
    details: "",
  });

  // ================= FETCH ALL =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/achievements/all", {
        headers: { Authorization: `Bearer ${token}` },
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

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/achievements/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      alert(`✅ Achievement ${status} successfully!`);
    } catch (err) {
      console.log(err);
      alert("❌ Failed to update status");
    }
  };

  // ================= DELETE =================
  const deleteAchievement = async (id) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      try {
        const token = localStorage.getItem("token");
        await API.delete(`/achievements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
        alert("✅ Achievement deleted successfully!");
      } catch (err) {
        console.log(err);
        alert("❌ Failed to delete achievement");
      }
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditForm({
      name: item.name || "",
      prn: item.prn || "",
      empId: item.empId || "",
      department: item.department || "",
      class: item.class || "",
      event: item.event || "",
      achievementType: item.achievementType || "",
      description: item.description || "",
      details: item.details || "",
    });
  };

  // ================= UPDATE =================
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/achievements/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Updated Successfully");
      setEditId(null);
      fetchData();
    } catch (err) {
      console.log(err);
      alert("❌ Update failed");
    }
  };

  // ================= DOWNLOAD EXCEL =================
  const downloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/admin/report/excel?year=${year}&status=approved`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `approved_achievement_report_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert("✅ Report downloaded successfully!");
    } catch (err) {
      console.log(err);
      alert("❌ Excel download failed");
    }
  };

  // ================= DOWNLOAD PDF =================
  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/admin/report/pdf?year=${year}&status=approved`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `approved_achievement_report_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert("✅ Report downloaded successfully!");
    } catch (err) {
      console.log(err);
      alert("❌ PDF download failed");
    }
  };

  // ================= YEARS =================
  const years = [...new Set(data.map((item) => new Date(item.createdAt).getFullYear()))].sort((a, b) => b - a);

  const buttonStyle = (type) => ({
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: hovered === type ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f8f9fa",
    color: hovered === type ? "white" : "#2d3748",
    transform: hovered === type ? "translateY(-2px)" : "translateY(0)",
    boxShadow: hovered === type ? "0 8px 20px rgba(102, 126, 234, 0.3)" : "0 2px 6px rgba(0,0,0,0.08)",
    marginRight: "8px",
    marginBottom: "8px",
  });

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
    width: "calc(100% - 28px)",
    marginBottom: "10px",
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "#48bb78";
      case "rejected": return "#f56565";
      default: return "#ed8936";
    }
  };

  const stats = {
    total: data.length,
    pending: data.filter(d => d.status === "pending").length,
    approved: data.filter(d => d.status === "approved").length,
    rejected: data.filter(d => d.status === "rejected").length,
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header Stats */}
      <div style={{
        background: "linear-gradient(135deg, #ed8936, #dd6b20)",
        borderRadius: "20px",
        padding: "30px",
        marginBottom: "30px",
        color: "white",
        boxShadow: "0 10px 40px rgba(237, 137, 54, 0.3)"
      }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>🛠️ Admin Dashboard</h1>
          <p style={{ opacity: 0.9 }}>System Overview & Management</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginTop: "20px" }}>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "15px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.total}</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Total Achievements</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "15px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.pending}</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Pending Approval</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "15px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.approved}</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Approved</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "15px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.rejected}</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "25px",
        marginBottom: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ color: "#2d3748", marginBottom: "15px" }}>📊 Download Reports</h2>
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: "150px" }}
          >
            <option value="">Select Year</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <button
            onClick={downloadExcel}
            disabled={!year}
            style={{ ...buttonStyle("excel"), background: year ? "#48bb78" : "#cbd5e0", color: "white" }}
            onMouseEnter={() => setHovered("excel")}
            onMouseLeave={() => setHovered(null)}
          >
            📊 Download Excel
          </button>
          <button
            onClick={downloadPDF}
            disabled={!year}
            style={{ ...buttonStyle("pdf"), background: year ? "#f56565" : "#cbd5e0", color: "white" }}
            onMouseEnter={() => setHovered("pdf")}
            onMouseLeave={() => setHovered(null)}
          >
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* Achievements List */}
      <h2 style={{ color: "#2d3748", marginBottom: "20px" }}>📋 All Achievements ({data.length})</h2>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "20px" }}>
          <div style={{ fontSize: "40px" }}>⏳</div>
          <p>Loading achievements...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "20px" }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>📭</div>
          <h3>No achievements found</h3>
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
                transition: "all 0.3s ease",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", marginBottom: "15px" }}>
                <h3 style={{ color: "#2d3748", fontSize: "20px", marginBottom: "8px" }}>{item.event}</h3>
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
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
                <p><strong>Name:</strong> {item.name}</p>
                <p><strong>Role:</strong> {item.role}</p>
                {item.prn && <p><strong>PRN:</strong> {item.prn}</p>}
                {item.empId && <p><strong>Employee ID:</strong> {item.empId}</p>}
                {item.department && <p><strong>Department:</strong> {item.department}</p>}
                {item.class && <p><strong>Class:</strong> {item.class}</p>}
                {item.achievementType && <p><strong>Achievement Type:</strong> {item.achievementType}</p>}
                {item.description && <p><strong>Description:</strong> {item.description}</p>}
                {item.details && <p><strong>Details:</strong> {item.details}</p>}
              </div>
              
              {item.certificate && (
                <p style={{ marginBottom: "15px" }}>
                  <a href={item.certificate} target="_blank" rel="noreferrer" style={{ color: "#667eea", textDecoration: "none" }}>
                    📎 View Certificate
                  </a>
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "15px", borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
                <button
                  onClick={() => updateStatus(item._id, "approved")}
                  style={{ ...buttonStyle(`approve-${item._id}`), background: "#48bb78", color: "white" }}
                  onMouseEnter={() => setHovered(`approve-${item._id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => updateStatus(item._id, "rejected")}
                  style={{ ...buttonStyle(`reject-${item._id}`), background: "#f56565", color: "white" }}
                  onMouseEnter={() => setHovered(`reject-${item._id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => deleteAchievement(item._id)}
                  style={{ ...buttonStyle(`delete-${item._id}`), background: "#a0aec0", color: "white" }}
                  onMouseEnter={() => setHovered(`delete-${item._id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  style={{ ...buttonStyle(`edit-${item._id}`), background: "#ed8936", color: "white" }}
                  onMouseEnter={() => setHovered(`edit-${item._id}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  ✏️ Edit
                </button>
              </div>

              {/* Edit Form */}
              {editId === item._id && (
                <div style={{ marginTop: "20px", padding: "15px", background: "#f7fafc", borderRadius: "12px" }}>
                  <h4 style={{ marginBottom: "15px" }}>Edit Achievement</h4>
                  <input style={inputStyle} placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  <input style={inputStyle} placeholder="PRN" value={editForm.prn} onChange={(e) => setEditForm({...editForm, prn: e.target.value})} />
                  <input style={inputStyle} placeholder="Employee ID" value={editForm.empId} onChange={(e) => setEditForm({...editForm, empId: e.target.value})} />
                  <input style={inputStyle} placeholder="Department" value={editForm.department} onChange={(e) => setEditForm({...editForm, department: e.target.value})} />
                  <input style={inputStyle} placeholder="Class" value={editForm.class} onChange={(e) => setEditForm({...editForm, class: e.target.value})} />
                  <input style={inputStyle} placeholder="Event" value={editForm.event} onChange={(e) => setEditForm({...editForm, event: e.target.value})} />
                  <input style={inputStyle} placeholder="Achievement Type" value={editForm.achievementType} onChange={(e) => setEditForm({...editForm, achievementType: e.target.value})} />
                  <textarea style={inputStyle} placeholder="Description" rows="2" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                  <textarea style={inputStyle} placeholder="Details" rows="2" value={editForm.details} onChange={(e) => setEditForm({...editForm, details: e.target.value})} />
                  
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button onClick={() => handleUpdate(item._id)} style={{ ...buttonStyle("save"), background: "#48bb78", color: "white" }}>💾 Save</button>
                    <button onClick={() => setEditId(null)} style={{ ...buttonStyle("cancel"), background: "#a0aec0", color: "white" }}>❌ Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;