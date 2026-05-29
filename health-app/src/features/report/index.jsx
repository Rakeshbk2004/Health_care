import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const CATEGORIES = ["Blood Test", "Scan", "X-Ray", "Prescription", "Other"];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileType: "pdf",
    category: "Other",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://https://health-care-10-hgbr.onrender.com/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.log("Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        fileUrl: reader.result,
        fileName: file.name,
        fileType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title || !form.fileUrl) {
      setMessage({ type: "error", text: "Title and file are required" });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await axios.post("http://localhost:5000/api/reports", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: "success", text: "Report uploaded successfully" });
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        fileUrl: "",
        fileName: "",
        fileType: "pdf",
        category: "Other",
      });
      fetchReports();
    } catch (err) {
      setMessage({ type: "error", text: "Upload failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this report?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ✅ Download handler
  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const getCategoryIcon = (cat) => {
    if (cat === "Blood Test") return "🩸";
    if (cat === "Scan") return "🧠";
    if (cat === "X-Ray") return "🦴";
    if (cat === "Prescription") return "💊";
    return "📄";
  };

  if (loading) {
    return (
      <div className="rep-loading">
        <div className="rep-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="rep-container">
      {/* HEADER */}
      <div className="rep-header">
        <div>
          <h2>Medical Reports</h2>
          <p>
            {reports.length} report{reports.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button className="rep-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Upload Report"}
        </button>
      </div>

      {/* UPLOAD FORM */}
      {showForm && (
        <div className="rep-form">
          <h3>Upload New Report</h3>

          <div className="rep-field">
            <label>Report Title *</label>
            <input
              type="text"
              placeholder="e.g. Blood Test Report"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="rep-field">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="rep-field">
            <label>Description (optional)</label>
            <textarea
              placeholder="Any notes about this report..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="rep-field">
            <label>Upload File *</label>
            <div className="rep-file-box">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                id="fileInput"
                style={{ display: "none" }}
              />
              <label htmlFor="fileInput" className="rep-file-label">
                {form.fileName || "Choose file (PDF, JPG, PNG)"}
              </label>
            </div>
          </div>

          {message && (
            <p className={`rep-msg rep-msg--${message.type}`}>{message.text}</p>
          )}

          <button
            className="rep-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Uploading..." : "Save Report"}
          </button>
        </div>
      )}

      {/* REPORTS LIST */}
      {reports.length === 0 ? (
        <div className="rep-empty">
          <div className="rep-empty-icon">🗂</div>
          <h3>No Reports Yet</h3>
          <p>Upload your medical reports to keep them safe</p>
        </div>
      ) : (
        <div className="rep-list">
          {reports.map((report) => (
            <div className="rep-card" key={report._id}>
              {/* LEFT */}
              <div className="rep-left">
                <div className="rep-icon">
                  {getCategoryIcon(report.category)}
                </div>
                <div className="rep-info">
                  <h3>{report.title}</h3>
                  <p className="rep-category">{report.category}</p>
                  {report.description && (
                    <p className="rep-desc">{report.description}</p>
                  )}
                  <p className="rep-date">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="rep-right">
                {/* ✅ Fixed download button */}
                <button
                  className="rep-view-btn"
                  onClick={() =>
                    handleDownload(report.fileUrl, report.fileName)
                  }
                >
                  Download
                </button>

                <button
                  className="rep-delete-btn"
                  onClick={() => handleDelete(report._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
