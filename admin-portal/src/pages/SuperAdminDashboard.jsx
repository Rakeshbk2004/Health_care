// src/pages/SuperAdminDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  StatCard,
  PageHeader,
  Card,
  Badge,
  Btn,
  Input,
  Table,
  Loading,
  SearchBar,
} from "../components/AdminUI";

const API = "http://localhost:5000/api";
const TOKEN = () => localStorage.getItem("adminToken");
const headers = () => ({ Authorization: `Bearer ${TOKEN()}` });

// ── Status config for medicine orders ─────────────────────────────────────
const MED_STATUS_COLORS = {
  Pending: { bg: "#fef9c3", color: "#92400e" },
  Reviewing: { bg: "#ede9fe", color: "#5b21b6" },
  Confirmed: { bg: "#dcfce7", color: "#166534" },
  Dispatched: { bg: "#dbeafe", color: "#1e40af" },
  Delivered: { bg: "#f0fdf4", color: "#14532d" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b" },
};
const ORDER_STATUSES = [
  "Pending",
  "Reviewing",
  "Confirmed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

// ─── MEDICINE ORDERS SECTION (Super Admin) ────────────────────────────────
function MedicineOrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [staffNotes, setStaffNotes] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/medicine-orders/all`, {
        headers: headers(),
      });
      setOrders(res.data.orders || []);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(
        "Medicine orders fetch error:",
        e.response?.data || e.message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.patch(
        `${API}/medicine-orders/${orderId}/status`,
        { status: newStatus, staffNote: staffNotes[orderId] || "" },
        { headers: headers() },
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (e) {
      alert(e.response?.data?.message || "Status update failed ❌");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch =
      !search ||
      o.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      o.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.hospitalName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    confirmed: orders.filter((o) => o.status === "Confirmed").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div>
      <PageHeader
        title="Medicine Orders"
        subtitle={`${orders.length} total orders · Refreshed: ${lastRefresh.toLocaleTimeString()}`}
        action={<Btn onClick={fetchOrders}>🔄 Refresh</Btn>}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="💊"
          label="Total Orders"
          value={stats.total}
          color="#6366f1"
        />
        <StatCard
          icon="⏳"
          label="Pending"
          value={stats.pending}
          color="#f59e0b"
        />
        <StatCard
          icon="✅"
          label="Confirmed"
          value={stats.confirmed}
          color="#22c55e"
        />
        <StatCard
          icon="🚚"
          label="Delivered"
          value={stats.delivered}
          color="#10b981"
        />
      </div>

      {stats.pending > 0 && (
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "#92400e",
            fontWeight: 500,
          }}
        >
          ⚠️ {stats.pending} order{stats.pending > 1 ? "s are" : " is"} pending
          review across all hospitals.
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["All", ...ORDER_STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#6366f1" : "#e2e8f0",
              background: filter === f ? "#6366f118" : "white",
              color: filter === f ? "#6366f1" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
            {f !== "All" && orders.filter((o) => o.status === f).length > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  background: f === filter ? "#6366f1" : "#e2e8f0",
                  color: f === filter ? "white" : "#64748b",
                  borderRadius: 10,
                  padding: "0 6px",
                  fontSize: 11,
                }}
              >
                {orders.filter((o) => o.status === f).length}
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, phone, hospital…"
          />
        </div>
      </div>

      {loading && <Loading />}

      {!loading && orders.length === 0 && (
        <Card>
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
            💊 No medicine orders yet. They will appear here when patients place
            orders.
          </div>
        </Card>
      )}

      {!loading && orders.length > 0 && (
        <Card>
          <Table
            headers={[
              "Patient",
              "Phone",
              "Address",
              "Hospital",
              "Date",
              "Status",
              "Change Status",
            ]}
            emptyMsg="No orders match this filter."
            rows={filtered.map((o) => [
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                  {o.patientName}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>
                  {o.userEmail}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {o.prescriptionUrl && (
                    <a
                      href={`http://localhost:5000${o.prescriptionUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1" }}
                    >
                      📋 Prescription
                    </a>
                  )}
                  {o.tabletImageUrl && (
                    <a
                      href={`http://localhost:5000${o.tabletImageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1" }}
                    >
                      💊 Image
                    </a>
                  )}
                </div>
              </div>,
              <div style={{ fontSize: 13, color: "#475569" }}>{o.phone}</div>,
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {o.address}, {o.pincode}
                {o.note && (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontStyle: "italic",
                      marginTop: 2,
                    }}
                  >
                    "{o.note}"
                  </div>
                )}
              </div>,
              <div style={{ fontSize: 12 }}>
                {o.hospitalName ? (
                  <>
                    <div style={{ fontWeight: 600 }}>{o.hospitalName}</div>
                    <div style={{ color: "#94a3b8" }}>{o.hospitalDistrict}</div>
                  </>
                ) : (
                  <span style={{ color: "#94a3b8" }}>🏠 Home Delivery</span>
                )}
              </div>,
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })}
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>,
              <span
                style={{
                  background: MED_STATUS_COLORS[o.status]?.bg || "#f1f5f9",
                  color: MED_STATUS_COLORS[o.status]?.color || "#475569",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {o.status}
              </span>,
              <div style={{ minWidth: 150 }}>
                <select
                  value={o.status}
                  disabled={updatingId === o._id}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "white",
                    marginBottom: 5,
                  }}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Staff note (optional)"
                  value={staffNotes[o._id] || ""}
                  onChange={(e) =>
                    setStaffNotes((prev) => ({
                      ...prev,
                      [o._id]: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#475569",
                  }}
                />
                {updatingId === o._id && (
                  <div style={{ fontSize: 11, color: "#6366f1", marginTop: 3 }}>
                    Updating…
                  </div>
                )}
              </div>,
            ])}
          />
        </Card>
      )}
    </div>
  );
}

// ─── HOSPITAL DETAIL DASHBOARD ────────────────────────────────────────────
function HospitalDetailDashboard({ hospital, onBack }) {
  const [tab, setTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [labBookings, setLabBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freshHospital, setFreshHospital] = useState(hospital);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/hospitals/${hospital._id}`);
      setFreshHospital(data);
    } catch (e) {
      console.error(e);
    }
    try {
      const { data } = await axios.get(`${API}/bookings/all`, {
        headers: headers(),
      });
      const all = data.bookings ?? data;
      setBookings(
        all.filter(
          (b) =>
            b.hospitalId === hospital._id || b.hospitalName === hospital.name,
        ),
      );
    } catch (e) {
      console.error(e);
    }
    try {
      const { data } = await axios.get(`${API}/lab-bookings/all`, {
        headers: headers(),
      });
      setLabBookings(data.bookings ?? data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [hospital._id, hospital.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/bookings/${id}/status`,
        { status },
        { headers: headers() },
      );
      loadData();
    } catch {
      alert("Update failed");
    }
  };

  const TABS = [
    { key: "overview", label: "Overview", icon: "◈" },
    { key: "doctors", label: "Doctors", icon: "👨‍⚕️" },
    { key: "appointments", label: "Appointments", icon: "📅" },
    { key: "lab", label: "Lab Bookings", icon: "🧫" },
    { key: "reports", label: "Reports", icon: "📊" },
  ];

  const [docForm, setDocForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    fee: "",
    phone: "",
    email: "",
    available: true,
  });
  const [addingDoc, setAddingDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docMsg, setDocMsg] = useState("");
  const [docSaving, setDocSaving] = useState(false);
  const [docSearch, setDocSearch] = useState("");

  const resetDocForm = () =>
    setDocForm({
      name: "",
      specialization: "",
      experience: "",
      fee: "",
      phone: "",
      email: "",
      available: true,
    });

  const saveDoctor = async () => {
    if (!docForm.name || !docForm.specialization)
      return alert("Name and specialization required");
    setDocSaving(true);
    try {
      if (editingDoc) {
        await axios.patch(
          `${API}/hospitals/${freshHospital._id}/doctors/${editingDoc._id}`,
          docForm,
          { headers: headers() },
        );
        setDocMsg("Doctor updated ✅");
        setEditingDoc(null);
      } else {
        await axios.post(
          `${API}/hospitals/${freshHospital._id}/doctors`,
          docForm,
          { headers: headers() },
        );
        setDocMsg("Doctor added ✅");
      }
      setAddingDoc(false);
      resetDocForm();
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Failed ❌");
    }
    setDocSaving(false);
  };

  const deleteDoctor = async (docId) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await axios.delete(
        `${API}/hospitals/${freshHospital._id}/doctors/${docId}`,
        { headers: headers() },
      );
      setDocMsg("Doctor deleted ✅");
      loadData();
    } catch {
      alert("Delete failed ❌");
    }
  };

  const toggleAvailable = async (doc) => {
    try {
      await axios.patch(
        `${API}/hospitals/${freshHospital._id}/doctors/${doc._id}`,
        { available: !doc.available },
        { headers: headers() },
      );
      loadData();
    } catch {
      alert("Update failed ❌");
    }
  };

  const startEditDoc = (doc) => {
    setEditingDoc(doc);
    setDocForm({
      name: doc.name,
      specialization: doc.specialization,
      experience: doc.experience,
      fee: doc.fee,
      phone: doc.phone,
      email: doc.email,
      available: doc.available,
    });
    setAddingDoc(true);
    window.scrollTo(0, 0);
  };

  const Bar = ({ label, value, max, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
      </div>
      <div
        style={{
          height: 8,
          background: "#f1f5f9",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: max ? (value / max) * 100 + "%" : "0%",
            background: color,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );

  const bByStatus = bookings.reduce((a, b) => {
    a[b.status] = (a[b.status] || 0) + 1;
    return a;
  }, {});
  const lbByStatus = labBookings.reduce((a, b) => {
    a[b.status] = (a[b.status] || 0) + 1;
    return a;
  }, {});

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "white",
            border: "1.5px solid #e2e8f0",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          ← Back to Hospitals
        </button>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {freshHospital.name}
          </h1>
          <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 13 }}>
            📍 {freshHospital.address}, {freshHospital.city} &nbsp;|&nbsp;{" "}
            <Badge status={freshHospital.status} />
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "#6366f1" : "#64748b",
              borderBottom:
                tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {tab === "overview" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <StatCard
                  icon="👨‍⚕️"
                  label="Doctors"
                  value={freshHospital.doctors?.length || 0}
                  color="#6366f1"
                />
                <StatCard
                  icon="📅"
                  label="Appointments"
                  value={bookings.length}
                  color="#0ea5e9"
                />
                <StatCard
                  icon="⏳"
                  label="Pending"
                  value={bByStatus.Pending || 0}
                  color="#f59e0b"
                />
                <StatCard
                  icon="✅"
                  label="Confirmed"
                  value={bByStatus.Confirmed || 0}
                  color="#22c55e"
                />
                <StatCard
                  icon="🧫"
                  label="Lab Bookings"
                  value={labBookings.length}
                  color="#10b981"
                />
              </div>
              <Card>
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Hospital Info
                </div>
                <div
                  style={{
                    padding: 20,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  {[
                    [
                      "📍 Address",
                      freshHospital.address + ", " + freshHospital.city,
                    ],
                    ["📞 Phone", freshHospital.phone || "—"],
                    ["📧 Email", freshHospital.email || "—"],
                    [
                      "🕐 Hours",
                      freshHospital.openTime + " – " + freshHospital.closeTime,
                    ],
                    ["🏥 Type", freshHospital.type],
                    ["⭐ Rating", freshHospital.rating || "—"],
                    [
                      "👤 Admin",
                      freshHospital.adminName +
                        " (" +
                        freshHospital.adminEmail +
                        ")",
                    ],
                    [
                      "🔬 Specializations",
                      freshHospital.specializations?.join(", ") || "—",
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: 11,
                          marginBottom: 3,
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "doctors" && (
            <div>
              <PageHeader
                title="Doctors"
                subtitle={(freshHospital.doctors?.length || 0) + " doctors"}
                action={
                  <Btn
                    onClick={() => {
                      setAddingDoc((a) => !a);
                      setEditingDoc(null);
                      resetDocForm();
                    }}
                  >
                    + Add Doctor
                  </Btn>
                }
              />
              {docMsg && (
                <div
                  style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    padding: "10px 16px",
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  {docMsg}
                </div>
              )}
              {addingDoc && (
                <Card style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #f1f5f9",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {editingDoc ? "Edit Doctor" : "Add New Doctor"}
                  </div>
                  <div
                    style={{
                      padding: 20,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Input
                      label="Doctor Name *"
                      value={docForm.name}
                      onChange={(e) =>
                        setDocForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Dr. Full Name"
                    />
                    <Input
                      label="Specialization *"
                      value={docForm.specialization}
                      onChange={(e) =>
                        setDocForm((f) => ({
                          ...f,
                          specialization: e.target.value,
                        }))
                      }
                      placeholder="e.g. Cardiologist"
                    />
                    <Input
                      label="Experience (years)"
                      value={docForm.experience}
                      onChange={(e) =>
                        setDocForm((f) => ({
                          ...f,
                          experience: e.target.value,
                        }))
                      }
                      placeholder="e.g. 10"
                    />
                    <Input
                      label="Consultation Fee"
                      value={docForm.fee}
                      onChange={(e) =>
                        setDocForm((f) => ({ ...f, fee: e.target.value }))
                      }
                      placeholder="e.g. 500"
                    />
                    <Input
                      label="Phone"
                      value={docForm.phone}
                      onChange={(e) =>
                        setDocForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="Doctor phone"
                    />
                    <Input
                      label="Email"
                      value={docForm.email}
                      onChange={(e) =>
                        setDocForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="Doctor email"
                    />
                  </div>
                  <div
                    style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}
                  >
                    <Btn onClick={saveDoctor} disabled={docSaving}>
                      {docSaving
                        ? "Saving…"
                        : editingDoc
                          ? "Update Doctor"
                          : "Add Doctor"}
                    </Btn>
                    <Btn
                      outline
                      color="#64748b"
                      onClick={() => {
                        setAddingDoc(false);
                        setEditingDoc(null);
                        resetDocForm();
                      }}
                    >
                      Cancel
                    </Btn>
                  </div>
                </Card>
              )}
              <div style={{ marginBottom: 12 }}>
                <SearchBar
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search doctors…"
                />
              </div>
              <Card>
                <Table
                  headers={[
                    "Doctor",
                    "Specialization",
                    "Exp",
                    "Fee",
                    "Status",
                    "Actions",
                  ]}
                  emptyMsg="No doctors yet."
                  rows={(freshHospital.doctors || [])
                    .filter(
                      (d) =>
                        !docSearch ||
                        d.name
                          ?.toLowerCase()
                          .includes(docSearch.toLowerCase()) ||
                        d.specialization
                          ?.toLowerCase()
                          .includes(docSearch.toLowerCase()),
                    )
                    .map((d) => [
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: 11 }}>
                          {d.email || "—"}
                        </div>
                      </div>,
                      <div style={{ color: "#64748b", fontSize: 13 }}>
                        {d.specialization}
                      </div>,
                      d.experience ? d.experience + " yrs" : "—",
                      d.fee ? "₹" + d.fee : "—",
                      <Badge
                        status={d.available ? "confirmed" : "cancelled"}
                      />,
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn
                          small
                          outline
                          color="#6366f1"
                          onClick={() => startEditDoc(d)}
                        >
                          Edit
                        </Btn>
                        <Btn
                          small
                          outline
                          color={d.available ? "#f59e0b" : "#22c55e"}
                          onClick={() => toggleAvailable(d)}
                        >
                          {d.available ? "Unavailable" : "Available"}
                        </Btn>
                        <Btn
                          small
                          outline
                          color="#ef4444"
                          onClick={() => deleteDoctor(d._id)}
                        >
                          Delete
                        </Btn>
                      </div>,
                    ])}
                />
              </Card>
            </div>
          )}

          {tab === "appointments" && (
            <div>
              <PageHeader
                title="Appointments"
                subtitle={bookings.length + " appointments"}
              />
              <Card>
                <Table
                  headers={[
                    "Patient",
                    "Doctor",
                    "Date",
                    "Time",
                    "Specialization",
                    "Status",
                    "Actions",
                  ]}
                  emptyMsg="No appointments"
                  rows={bookings.map((b) => [
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {b.patientName || "—"}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>
                        {b.phone}
                      </div>
                    </div>,
                    b.doctorName,
                    b.date,
                    b.time,
                    <div style={{ color: "#64748b", fontSize: 12 }}>
                      {b.specialization || "—"}
                    </div>,
                    <Badge status={b.status} />,
                    <div style={{ display: "flex", gap: 6 }}>
                      {b.status === "Pending" && (
                        <>
                          <Btn
                            small
                            color="#22c55e"
                            onClick={() =>
                              updateBookingStatus(b._id, "Confirmed")
                            }
                          >
                            Confirm
                          </Btn>
                          <Btn
                            small
                            color="#ef4444"
                            onClick={() =>
                              updateBookingStatus(b._id, "Cancelled")
                            }
                          >
                            Cancel
                          </Btn>
                        </>
                      )}
                      {b.status === "Confirmed" && (
                        <Btn
                          small
                          color="#6366f1"
                          onClick={() =>
                            updateBookingStatus(b._id, "Completed")
                          }
                        >
                          Complete
                        </Btn>
                      )}
                    </div>,
                  ])}
                />
              </Card>
            </div>
          )}

          {tab === "lab" && (
            <div>
              <PageHeader
                title="Lab Bookings"
                subtitle={labBookings.length + " lab bookings"}
              />
              <Card>
                <Table
                  headers={[
                    "Lab",
                    "User",
                    "Tests",
                    "Date",
                    "Time",
                    "Collection",
                    "Status",
                  ]}
                  emptyMsg="No lab bookings"
                  rows={labBookings.map((b) => [
                    <div style={{ fontWeight: 600 }}>{b.labName}</div>,
                    <div style={{ color: "#64748b", fontSize: 12 }}>
                      {b.userEmail}
                    </div>,
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {b.tests?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            borderRadius: 4,
                            padding: "1px 6px",
                            fontSize: 11,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                      {b.tests?.length > 3 && (
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>
                          +{b.tests.length - 3}
                        </span>
                      )}
                    </div>,
                    b.date,
                    b.timeSlot,
                    b.collectionType === "home" ? "🏠 Home" : "🏥 Walk-in",
                    <Badge status={b.status} />,
                  ])}
                />
              </Card>
            </div>
          )}

          {tab === "reports" && (
            <div>
              <PageHeader
                title="Reports"
                subtitle={"Stats for " + freshHospital.name}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <Card>
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f1f5f9",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Appointment Status
                  </div>
                  <div style={{ padding: 20 }}>
                    {Object.keys(bByStatus).length === 0 ? (
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>
                        No appointments yet
                      </p>
                    ) : (
                      Object.entries(bByStatus).map(([k, v]) => (
                        <Bar
                          key={k}
                          label={k}
                          value={v}
                          max={bookings.length}
                          color={
                            k === "Confirmed"
                              ? "#22c55e"
                              : k === "Cancelled"
                                ? "#ef4444"
                                : k === "Completed"
                                  ? "#6366f1"
                                  : "#f59e0b"
                          }
                        />
                      ))
                    )}
                  </div>
                </Card>
                <Card>
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f1f5f9",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Lab Booking Status
                  </div>
                  <div style={{ padding: 20 }}>
                    {Object.keys(lbByStatus).length === 0 ? (
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>
                        No lab bookings yet
                      </p>
                    ) : (
                      Object.entries(lbByStatus).map(([k, v]) => (
                        <Bar
                          key={k}
                          label={k}
                          value={v}
                          max={labBookings.length}
                          color={
                            k === "Confirmed"
                              ? "#22c55e"
                              : k === "Cancelled"
                                ? "#ef4444"
                                : "#10b981"
                          }
                        />
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── HOSPITALS LIST ───────────────────────────────────────────────────────
function HospitalsSection() {
  const [hospitals, setHospitals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [password, setPassword] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        filter === "pending"
          ? `${API}/hospitals/pending`
          : `${API}/hospitals/all`;
      const { data } = await axios.get(url);
      setHospitals(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const approve = async (id) => {
    const pw = password[id];
    if (!pw) return alert("Enter a password for this hospital admin");
    try {
      const { data } = await axios.post(`${API}/hospitals/approve/${id}`, {
        password: pw,
      });
      setMsg(data.message);
      fetchHospitals();
    } catch (e) {
      alert(e.response?.data?.message || "Failed");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this hospital?")) return;
    try {
      const { data } = await axios.post(`${API}/hospitals/reject/${id}`);
      setMsg(data.message);
      fetchHospitals();
    } catch (e) {
      alert(e.response?.data?.message || "Failed");
    }
  };

  const deleteHospital = async (id) => {
    if (!window.confirm("Permanently delete this hospital?")) return;
    try {
      await axios.delete(`${API}/hospitals/${id}`, { headers: headers() });
      setMsg("Hospital deleted ✅");
      fetchHospitals();
    } catch (e) {
      alert(e.response?.data?.message || "Failed");
    }
  };

  if (selectedHospital)
    return (
      <HospitalDetailDashboard
        hospital={selectedHospital}
        onBack={() => setSelectedHospital(null)}
      />
    );

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Hospitals"
        subtitle="Manage and approve hospital registrations"
      />
      {msg && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#166534",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#6366f1" : "#e2e8f0",
              background: filter === f ? "#6366f118" : "white",
              color: filter === f ? "#6366f1" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals…"
          />
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Card>
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
            No hospitals found.
          </div>
        </Card>
      ) : (
        filtered.map((h) => (
          <Card key={h._id} style={{ marginBottom: 12 }}>
            <div style={{ padding: "18px 20px" }}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#0f172a",
                      }}
                    >
                      {h.name}
                    </span>
                    <Badge status={h.status} />
                  </div>
                  <div
                    style={{ color: "#64748b", fontSize: 13, lineHeight: 1.8 }}
                  >
                    <div>
                      📍 {h.address}, {h.city}
                    </div>
                    <div>
                      📞 {h.phone || "—"} &nbsp;|&nbsp; 📧 {h.email || "—"}
                    </div>
                    <div>
                      👤 {h.adminName} ({h.adminEmail})
                    </div>
                    <div>
                      🏥 {h.type} &nbsp;|&nbsp; 🕐 {h.openTime}–{h.closeTime}
                    </div>
                    <div>👨‍⚕️ {h.doctors?.length || 0} doctors</div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minWidth: 180,
                  }}
                >
                  <Btn color="#6366f1" onClick={() => setSelectedHospital(h)}>
                    📊 View Dashboard
                  </Btn>
                  {h.status === "pending" && (
                    <>
                      <input
                        type="text"
                        placeholder="Set admin password"
                        value={password[h._id] || ""}
                        onChange={(e) =>
                          setPassword((p) => ({
                            ...p,
                            [h._id]: e.target.value,
                          }))
                        }
                        style={{
                          padding: "8px 12px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                      <Btn color="#22c55e" onClick={() => approve(h._id)}>
                        ✅ Approve
                      </Btn>
                      <Btn color="#ef4444" onClick={() => reject(h._id)}>
                        ❌ Reject
                      </Btn>
                    </>
                  )}
                  {h.status === "approved" && (
                    <Btn
                      outline
                      color="#ef4444"
                      onClick={() => deleteHospital(h._id)}
                    >
                      🗑 Delete
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── DOCTOR BOOKINGS ──────────────────────────────────────────────────────
function DoctorBookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    axios
      .get(`${API}/bookings/all`, { headers: headers() })
      .then((r) => setBookings(r.data.bookings ?? r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/bookings/${id}/status`,
        { status },
        { headers: headers() },
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
    } catch {
      alert("Update failed");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      b.hospitalName?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "All" || b.status === filter);
  });

  return (
    <div>
      <PageHeader
        title="Doctor Bookings"
        subtitle={bookings.length + " total bookings"}
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#6366f1" : "#e2e8f0",
              background: filter === f ? "#6366f118" : "white",
              color: filter === f ? "#6366f1" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings…"
          />
        </div>
      </div>
      <Card>
        {loading ? (
          <Loading />
        ) : (
          <Table
            headers={[
              "Patient",
              "Doctor",
              "Hospital",
              "Date",
              "Time",
              "Status",
              "Actions",
            ]}
            emptyMsg="No bookings found"
            rows={filtered.map((b) => [
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                  {b.patientName || "—"}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>
                  {b.userEmail}
                </div>
              </div>,
              <div>
                <div style={{ fontWeight: 500 }}>{b.doctorName}</div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>
                  {b.specialization}
                </div>
              </div>,
              b.hospitalName || "—",
              b.date,
              b.time,
              <Badge status={b.status} />,
              <div style={{ display: "flex", gap: 6 }}>
                {b.status === "Pending" && (
                  <>
                    <Btn
                      small
                      color="#22c55e"
                      onClick={() => updateStatus(b._id, "Confirmed")}
                    >
                      Confirm
                    </Btn>
                    <Btn
                      small
                      color="#ef4444"
                      onClick={() => updateStatus(b._id, "Cancelled")}
                    >
                      Cancel
                    </Btn>
                  </>
                )}
                {b.status === "Confirmed" && (
                  <Btn
                    small
                    color="#6366f1"
                    onClick={() => updateStatus(b._id, "Completed")}
                  >
                    Complete
                  </Btn>
                )}
              </div>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}

// ─── LAB BOOKINGS ─────────────────────────────────────────────────────────
function LabBookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    axios
      .get(`${API}/lab-bookings/all`, { headers: headers() })
      .then((r) => setBookings(r.data.bookings ?? r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/lab-bookings/${id}/status`,
        { status },
        { headers: headers() },
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
    } catch {
      alert("Update failed");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.labName?.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "All" || b.status === filter);
  });

  return (
    <div>
      <PageHeader
        title="Lab Bookings"
        subtitle={bookings.length + " total lab bookings"}
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#10b981" : "#e2e8f0",
              background: filter === f ? "#10b98118" : "white",
              color: filter === f ? "#10b981" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
          />
        </div>
      </div>
      <Card>
        {loading ? (
          <Loading />
        ) : (
          <Table
            headers={[
              "User",
              "Lab",
              "City",
              "Tests",
              "Date",
              "Time",
              "Collection",
              "Status",
              "Actions",
            ]}
            emptyMsg="No lab bookings found"
            rows={filtered.map((b) => [
              <div style={{ color: "#64748b", fontSize: 12 }}>
                {b.userEmail}
              </div>,
              <div style={{ fontWeight: 600 }}>{b.labName}</div>,
              b.city || "—",
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {b.tests?.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontSize: 11,
                    }}
                  >
                    {t}
                  </span>
                ))}
                {b.tests?.length > 3 && (
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>
                    +{b.tests.length - 3}
                  </span>
                )}
              </div>,
              b.date,
              b.timeSlot,
              b.collectionType === "home" ? "🏠 Home" : "🏥 Walk-in",
              <Badge status={b.status} />,
              <div style={{ display: "flex", gap: 6 }}>
                {b.status === "Pending" && (
                  <>
                    <Btn
                      small
                      color="#22c55e"
                      onClick={() => updateStatus(b._id, "Confirmed")}
                    >
                      Confirm
                    </Btn>
                    <Btn
                      small
                      color="#ef4444"
                      onClick={() => updateStatus(b._id, "Cancelled")}
                    >
                      Cancel
                    </Btn>
                  </>
                )}
                {b.status === "Confirmed" && (
                  <Btn
                    small
                    color="#6366f1"
                    onClick={() => updateStatus(b._id, "Completed")}
                  >
                    Complete
                  </Btn>
                )}
              </div>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}

// ─── USERS ────────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/users`, { headers: headers() }) // ✅ FIXED: /user → /users
      .then((r) => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={users.length + " registered users"}
        action={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
          />
        }
      />
      <Card>
        {loading ? (
          <Loading />
        ) : (
          <Table
            headers={["Name", "Email", "Role", "Joined"]}
            emptyMsg="No users found"
            rows={filtered.map((u) => [
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {u.name || "—"}
              </div>,
              <div style={{ color: "#64748b", fontSize: 12 }}>{u.email}</div>,
              <Badge status={u.role || "user"} />,
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </div>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────
function AnalyticsSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API}/bookings/all`, { headers: headers() }),
      axios.get(`${API}/lab-bookings/all`, { headers: headers() }),
      axios.get(`${API}/hospitals/all`),
      axios.get(`${API}/users`, { headers: headers() }), // ✅ FIXED: /user → /users
      axios.get(`${API}/medicine-orders/all`, { headers: headers() }),
    ]).then(([b, lb, h, u, mo]) => {
      const bookings =
        b.status === "fulfilled" ? (b.value.data.bookings ?? b.value.data) : [];
      const labBookings =
        lb.status === "fulfilled"
          ? (lb.value.data.bookings ?? lb.value.data)
          : [];
      const hospitals = h.status === "fulfilled" ? h.value.data : [];
      const users = u.status === "fulfilled" ? u.value.data : [];
      const medOrders =
        mo.status === "fulfilled" ? (mo.value.data.orders ?? []) : [];
      const bStatus = bookings.reduce((a, b) => {
        a[b.status] = (a[b.status] || 0) + 1;
        return a;
      }, {});
      const lbStatus = labBookings.reduce((a, b) => {
        a[b.status] = (a[b.status] || 0) + 1;
        return a;
      }, {});
      const hStatus = hospitals.reduce((a, h) => {
        a[h.status] = (a[h.status] || 0) + 1;
        return a;
      }, {});
      const moStatus = medOrders.reduce((a, o) => {
        a[o.status] = (a[o.status] || 0) + 1;
        return a;
      }, {});
      setData({
        bookings,
        labBookings,
        hospitals,
        users,
        medOrders,
        bStatus,
        lbStatus,
        hStatus,
        moStatus,
      });
    });
  }, []);

  if (!data) return <Loading />;

  const Bar = ({ label, value, max, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          {value}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "#f1f5f9",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: max ? (value / max) * 100 + "%" : "0%",
            background: color,
            borderRadius: 4,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Platform-wide statistics and insights"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="📅"
          label="Doctor Bookings"
          value={data.bookings.length}
          color="#6366f1"
          sub={(data.bStatus.Confirmed || 0) + " confirmed"}
        />
        <StatCard
          icon="🧫"
          label="Lab Bookings"
          value={data.labBookings.length}
          color="#10b981"
          sub={(data.lbStatus.Confirmed || 0) + " confirmed"}
        />
        <StatCard
          icon="🏥"
          label="Hospitals"
          value={data.hospitals.length}
          color="#0ea5e9"
          sub={(data.hStatus.approved || 0) + " approved"}
        />
        <StatCard
          icon="👥"
          label="Users"
          value={data.users.length}
          color="#f59e0b"
        />
        <StatCard
          icon="💊"
          label="Medicine Orders"
          value={data.medOrders.length}
          color="#8b5cf6"
          sub={(data.moStatus.Pending || 0) + " pending"}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              color: "#0f172a",
              fontSize: 14,
            }}
          >
            Doctor Booking Status
          </div>
          <div style={{ padding: 20 }}>
            {Object.entries(data.bStatus).map(([k, v]) => (
              <Bar
                key={k}
                label={k}
                value={v}
                max={data.bookings.length}
                color={
                  k === "Confirmed"
                    ? "#22c55e"
                    : k === "Cancelled"
                      ? "#ef4444"
                      : k === "Completed"
                        ? "#6366f1"
                        : "#f59e0b"
                }
              />
            ))}
            {Object.keys(data.bStatus).length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No data</p>
            )}
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              color: "#0f172a",
              fontSize: 14,
            }}
          >
            Medicine Order Status
          </div>
          <div style={{ padding: 20 }}>
            {Object.entries(data.moStatus).map(([k, v]) => (
              <Bar
                key={k}
                label={k}
                value={v}
                max={data.medOrders.length}
                color={
                  k === "Delivered"
                    ? "#22c55e"
                    : k === "Cancelled"
                      ? "#ef4444"
                      : k === "Dispatched"
                        ? "#f97316"
                        : k === "Confirmed"
                          ? "#10b981"
                          : "#f59e0b"
                }
              />
            ))}
            {Object.keys(data.moStatus).length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                No medicine orders yet
              </p>
            )}
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              color: "#0f172a",
              fontSize: 14,
            }}
          >
            Hospital Status
          </div>
          <div style={{ padding: 20 }}>
            {Object.entries(data.hStatus).map(([k, v]) => (
              <Bar
                key={k}
                label={k}
                value={v}
                max={data.hospitals.length}
                color={
                  k === "approved"
                    ? "#22c55e"
                    : k === "rejected"
                      ? "#ef4444"
                      : "#f59e0b"
                }
              />
            ))}
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              color: "#0f172a",
              fontSize: 14,
            }}
          >
            Summary
          </div>
          <div style={{ padding: 20 }}>
            {[
              [
                "Total bookings",
                data.bookings.length + data.labBookings.length,
              ],
              ["Medicine orders", data.medOrders.length],
              ["Pending med orders", data.moStatus.Pending || 0],
              ["Pending approvals", data.hStatus.pending || 0],
              ["Approved hospitals", data.hStatus.approved || 0],
              ["Registered users", data.users.length],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f8fafc",
                }}
              >
                <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────
function DashboardHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API}/hospitals/all`),
      axios.get(`${API}/bookings/all`, { headers: headers() }),
      axios.get(`${API}/lab-bookings/all`, { headers: headers() }),
      axios.get(`${API}/users`, { headers: headers() }), // ✅ FIXED: /user → /users
      axios.get(`${API}/medicine-orders/all`, { headers: headers() }),
    ]).then(([h, b, lb, u, mo]) => {
      setStats({
        hospitals: h.status === "fulfilled" ? h.value.data.length : 0,
        bookings:
          b.status === "fulfilled"
            ? (b.value.data.bookings?.length ?? b.value.data.length)
            : 0,
        labBookings:
          lb.status === "fulfilled"
            ? (lb.value.data.bookings?.length ?? lb.value.data.length)
            : 0,
        users: u.status === "fulfilled" ? u.value.data.length : 0,
        medOrders:
          mo.status === "fulfilled" ? (mo.value.data.orders?.length ?? 0) : 0,
        medPending:
          mo.status === "fulfilled"
            ? (mo.value.data.orders?.filter((o) => o.status === "Pending")
                .length ?? 0)
            : 0,
      });
    });
  }, []);

  if (!stats) return <Loading />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back, Super Admin 👋" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon="🏥"
          label="Total Hospitals"
          value={stats.hospitals}
          color="#6366f1"
        />
        <StatCard
          icon="📅"
          label="Doctor Bookings"
          value={stats.bookings}
          color="#0ea5e9"
        />
        <StatCard
          icon="🧫"
          label="Lab Bookings"
          value={stats.labBookings}
          color="#10b981"
        />
        <StatCard
          icon="👥"
          label="Registered Users"
          value={stats.users}
          color="#f59e0b"
        />
        <StatCard
          icon="💊"
          label="Medicine Orders"
          value={stats.medOrders}
          color="#8b5cf6"
          sub={
            stats.medPending > 0
              ? stats.medPending + " pending"
              : "All up to date"
          }
        />
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [tab, setTab] = useState("dashboard");

  const content = {
    dashboard: <DashboardHome />,
    hospitals: <HospitalsSection />,
    bookings: <DoctorBookingsSection />,
    "lab-bookings": <LabBookingsSection />,
    "medicine-orders": <MedicineOrdersSection />,
    users: <UsersSection />,
    analytics: <AnalyticsSection />,
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}
    >
      <Sidebar
        role="superadmin"
        activeTab={tab}
        onTabChange={setTab}
        name="Super Admin"
      />
      <main
        style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}
      >
        {content[tab] || <DashboardHome />}
      </main>
    </div>
  );
}
