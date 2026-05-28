// src/features/medicine/index.jsx
import { useState, useRef, useMemo, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://health-care-0irv.onrender.com/api"; // ✅ Update to deployed API

function toTitleCase(str) {
  if (!str) return "Other";
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupHospitalsByCity(hospitals) {
  const seen = new Set();
  const map = {};
  hospitals.forEach((h) => {
    const nameKey =
      (h.name || "").toLowerCase().trim() + (h.city || "").toLowerCase().trim();
    if (seen.has(nameKey)) return;
    seen.add(nameKey);
    const city = toTitleCase(h.city || h.district || "Other");
    if (!map[city]) map[city] = [];
    map[city].push({
      ...h,
      id: (h._id || h.id || "").toString(),
      location: h.address || h.location || h.city || "",
      beds: h.beds || h.totalBeds || 0,
      rating: h.rating || 4.0,
      emergency: h.emergency || false,
      type: h.type || "General",
      doctors: (h.doctors || []).map((d) => ({
        ...d,
        id: (d._id || d.id || "").toString(),
        available: d.available !== undefined ? d.available : true,
      })),
    });
  });
  return Object.entries(map).map(([district, hospitals]) => ({
    district,
    hospitals,
  }));
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .med-page {
    min-height: 100vh;
    background: #f7f4ef;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
  }

  .med-hero {
    background: #1a1a1a;
    padding: 64px 32px 48px;
    position: relative;
    overflow: hidden;
  }

  .med-hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: #e8ff47;
    opacity: 0.08;
  }

  .med-hero::after {
    content: '';
    position: absolute;
    bottom: -60px; left: 10%;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: #e8ff47;
    opacity: 0.05;
  }

  .med-hero-inner {
    max-width: 720px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .med-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(232,255,71,0.12);
    border: 1px solid rgba(232,255,71,0.25);
    color: #e8ff47;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
  }

  .med-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 16px;
    letter-spacing: -1px;
  }

  .med-hero h1 span { color: #e8ff47; }

  .med-hero p {
    color: rgba(255,255,255,0.5);
    font-size: 16px;
    font-weight: 300;
    line-height: 1.6;
  }

  .med-body {
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  .steps-row {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
    gap: 0;
  }

  .step-item { display: flex; align-items: center; flex: 1; }

  .step-dot {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    flex-shrink: 0;
    transition: all 0.3s;
    border: 2px solid #d4cfc7;
    background: #f7f4ef;
    color: #999;
  }

  .step-dot.done { background: #1a1a1a; border-color: #1a1a1a; color: #e8ff47; }
  .step-dot.active { background: #e8ff47; border-color: #e8ff47; color: #1a1a1a; box-shadow: 0 0 0 4px rgba(232,255,71,0.2); }

  .step-label { font-size: 11px; font-weight: 500; color: #999; margin-left: 8px; white-space: nowrap; letter-spacing: 0.3px; }
  .step-label.active { color: #1a1a1a; font-weight: 600; }
  .step-label.done { color: #555; }

  .step-line { flex: 1; height: 2px; background: #d4cfc7; margin: 0 12px; min-width: 20px; }
  .step-line.done { background: #1a1a1a; }

  .med-card {
    background: #fff;
    border-radius: 20px;
    padding: 32px;
    border: 1px solid #e8e4dc;
  }

  .med-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .med-card-sub {
    font-size: 14px;
    color: #888;
    font-weight: 300;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .upload-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 540px) { .upload-grid { grid-template-columns: 1fr; } }

  .upload-section-label {
    font-size: 12px;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 10px;
  }

  .upload-box {
    border: 2px dashed #d4cfc7;
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    background: #faf9f6;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .upload-box:hover { border-color: #1a1a1a; background: #f7f4ef; }
  .upload-box.dragging { border-color: #e8ff47; background: #fffde8; }
  .upload-box.done { border-color: #1a1a1a; border-style: solid; background: #f0fdf4; }

  .upload-icon { font-size: 32px; }
  .upload-label { font-size: 14px; font-weight: 500; color: #333; }
  .upload-hint { font-size: 12px; color: #aaa; }
  .upload-btn-ghost { font-size: 12px; font-weight: 600; color: #1a1a1a; background: #f0ede7; padding: 6px 14px; border-radius: 100px; margin-top: 4px; }
  .upload-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .upload-img { width: 80px; height: 80px; object-fit: cover; border-radius: 10px; }
  .upload-pdf-icon { font-size: 40px; }
  .upload-file-name { font-size: 12px; color: #555; word-break: break-all; text-align: center; }

  .upload-clear {
    font-size: 12px; color: #ef4444; background: none; border: none;
    cursor: pointer; margin-top: 6px; padding: 4px 8px; border-radius: 6px; font-weight: 500;
  }
  .upload-clear:hover { background: #fef2f2; }

  .upload-tips {
    background: #f7f4ef; border-radius: 12px; padding: 16px 18px;
    font-size: 13px; color: #666; margin-bottom: 24px; border-left: 3px solid #e8ff47;
  }
  .upload-tips strong { color: #1a1a1a; display: block; margin-bottom: 8px; }
  .upload-tips ul { padding-left: 16px; }
  .upload-tips li { margin-bottom: 4px; line-height: 1.5; }

  .co-error {
    background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
    padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px;
  }

  .btn-primary {
    width: 100%; padding: 16px 24px; background: #1a1a1a; color: #e8ff47;
    border: none; border-radius: 14px; font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    letter-spacing: 0.3px; display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .btn-primary:hover { background: #333; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-secondary {
    padding: 16px 24px; background: transparent; color: #555;
    border: 2px solid #d4cfc7; border-radius: 14px; font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .btn-secondary:hover { border-color: #1a1a1a; color: #1a1a1a; }

  .btn-row { display: flex; gap: 12px; }
  .btn-row .btn-primary { flex: 1; }

  /* Payment button */
  .btn-pay {
    width: 100%; padding: 16px 24px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff; border: none; border-radius: 14px;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 12px;
  }
  .btn-pay:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35); }
  .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Payment box */
  .payment-box {
    background: #f7f4ef;
    border: 1px solid #e8e4dc;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
  }

  .payment-box-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .payment-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
  }

  .payment-row.total {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    border-top: 1px solid #e8e4dc;
    padding-top: 10px;
    margin-top: 4px;
  }

  .payment-paid-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #dcfce7;
    color: #15803d;
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .payment-pending-note {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  /* Hospital Picker */
  .hosp-picker-filters { display: flex; gap: 10px; margin-bottom: 16px; }
  .hosp-search-wrap {
    flex: 1; display: flex; align-items: center; gap: 10px;
    background: #f7f4ef; border: 1px solid #e8e4dc; border-radius: 12px; padding: 10px 14px;
  }
  .hosp-search-wrap input { flex: 1; border: none; background: none; outline: none; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .hosp-search-wrap input::placeholder { color: #bbb; }
  .hosp-district-select { padding: 10px 14px; background: #f7f4ef; border: 1px solid #e8e4dc; border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #555; outline: none; cursor: pointer; }
  .hosp-count { font-size: 12px; color: #aaa; font-weight: 500; margin-bottom: 12px; letter-spacing: 0.3px; }
  .hosp-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; padding-right: 4px; }
  .hosp-list::-webkit-scrollbar { width: 4px; }
  .hosp-list::-webkit-scrollbar-track { background: transparent; }
  .hosp-list::-webkit-scrollbar-thumb { background: #d4cfc7; border-radius: 4px; }
  .hosp-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #faf9f6; border: 2px solid transparent; border-radius: 14px; cursor: pointer; transition: all 0.2s; }
  .hosp-card:hover { background: #f0ede7; border-color: #d4cfc7; }
  .hosp-card.selected { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
  .hosp-card.home-card { border: 2px dashed #d4cfc7; }
  .hosp-card.home-card.selected { border-style: solid; }
  .hosp-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: #fff; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .hosp-card.selected .hosp-card-icon { background: rgba(255,255,255,0.1); }
  .hosp-card-info { flex: 1; min-width: 0; }
  .hosp-card-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .hosp-card.selected .hosp-card-name { color: #fff; }
  .hosp-card-loc { font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
  .hosp-card.selected .hosp-card-loc { color: rgba(255,255,255,0.6); }
  .hosp-card-meta { display: flex; flex-wrap: wrap; gap: 6px; }
  .hosp-tag { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 100px; background: #f0ede7; color: #666; }
  .hosp-card.selected .hosp-tag { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
  .hosp-tag.green { background: #dcfce7; color: #15803d; }
  .hosp-card.selected .hosp-tag.green { background: rgba(232,255,71,0.15); color: #e8ff47; }
  .hosp-check { width: 28px; height: 28px; border-radius: 50%; background: #e8ff47; color: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  .hosp-loading { text-align: center; padding: 40px; color: #888; font-size: 14px; }
  .hosp-selected-banner { display: flex; align-items: center; gap: 12px; background: #1a1a1a; color: #fff; padding: 14px 18px; border-radius: 14px; margin-top: 16px; font-size: 13px; }
  .hosp-selected-banner strong { font-family: 'Syne', sans-serif; display: block; font-size: 14px; }
  .hosp-selected-banner span { color: rgba(255,255,255,0.5); font-size: 12px; }
  .hosp-selected-banner button { margin-left: auto; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .co-form { display: flex; flex-direction: column; gap: 16px; }
  .co-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 540px) { .co-row { grid-template-columns: 1fr; } }
  .co-group { display: flex; flex-direction: column; gap: 6px; }
  .co-group label { font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.6px; }
  .co-group input, .co-group textarea, .co-group select { padding: 12px 14px; background: #f7f4ef; border: 1.5px solid #e8e4dc; border-radius: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a1a1a; outline: none; transition: border-color 0.2s; resize: none; }
  .co-group input:focus, .co-group textarea:focus { border-color: #1a1a1a; background: #fff; }
  .co-group input::placeholder, .co-group textarea::placeholder { color: #bbb; }

  .files-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; align-items: center; }
  .file-chip { font-size: 12px; font-weight: 500; padding: 6px 12px; background: #f0ede7; color: #555; border-radius: 100px; display: flex; align-items: center; gap: 5px; }
  .file-chip-edit { font-size: 12px; font-weight: 600; padding: 6px 12px; background: none; border: 1.5px solid #d4cfc7; color: #888; border-radius: 100px; cursor: pointer; }
  .file-chip-edit:hover { border-color: #1a1a1a; color: #1a1a1a; }

  .spinner { width: 18px; height: 18px; border: 2px solid rgba(232,255,71,0.3); border-top-color: #e8ff47; border-radius: 50%; animation: spin 0.7s linear infinite; }
  .spinner-white { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .success-wrap { text-align: center; padding: 20px 0; }
  .success-anim { width: 80px; height: 80px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 24px; animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  @keyframes pop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .success-wrap h2 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 10px; letter-spacing: -0.5px; }
  .success-wrap p { color: #888; font-size: 14px; font-weight: 300; line-height: 1.6; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }
  .success-order-id { display: inline-block; background: #f7f4ef; border: 1px solid #e8e4dc; padding: 8px 20px; border-radius: 100px; font-size: 13px; color: #555; margin-bottom: 24px; }
  .success-order-id strong { color: #1a1a1a; font-family: 'Syne', sans-serif; }
  .success-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; text-align: left; }
  .success-step-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #555; padding: 12px 16px; background: #faf9f6; border-radius: 12px; border: 1px solid #e8e4dc; }
  .success-redirect { font-size: 12px; color: #bbb; margin-bottom: 20px !important; }
`;

function Steps({ current }) {
  const steps = ["Upload", "Hospital", "Details", "Done"];
  return (
    <div className="steps-row">
      {steps.map((s, i) => (
        <div key={s} className="step-item">
          <div
            className={`step-dot ${i < current ? "done" : i === current ? "active" : ""}`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`step-label ${i === current ? "active" : i < current ? "done" : ""}`}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className={`step-line ${i < current ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function UploadBox({ label, icon, accept, file, onFile, hint }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };
  const preview =
    file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
  return (
    <div
      className={`upload-box${dragging ? " dragging" : ""}${file ? " done" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => ref.current.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {preview ? (
        <div className="upload-preview">
          <img src={preview} alt="preview" className="upload-img" />
          <div className="upload-file-name">✅ {file.name}</div>
        </div>
      ) : file ? (
        <div className="upload-preview">
          <div className="upload-pdf-icon">📄</div>
          <div className="upload-file-name">✅ {file.name}</div>
        </div>
      ) : (
        <>
          <div className="upload-icon">{icon}</div>
          <div className="upload-label">{label}</div>
          <div className="upload-hint">{hint}</div>
          <div className="upload-btn-ghost">Browse / Drop here</div>
        </>
      )}
    </div>
  );
}

function HospitalPicker({
  selected,
  onSelect,
  groupedHospitals,
  loading,
  error,
}) {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All");

  const allHospitals = useMemo(
    () =>
      groupedHospitals.flatMap((d) =>
        d.hospitals.map((h) => ({ ...h, district: d.district })),
      ),
    [groupedHospitals],
  );

  const districts = ["All", ...groupedHospitals.map((d) => d.district)];

  const filtered = useMemo(() => {
    return allHospitals.filter((h) => {
      const matchD = district === "All" || h.district === district;
      const matchS =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.location || "").toLowerCase().includes(search.toLowerCase()) ||
        (h.type || "").toLowerCase().includes(search.toLowerCase());
      return matchD && matchS;
    });
  }, [search, district, allHospitals]);

  if (loading) return <div className="hosp-loading">⏳ Loading hospitals…</div>;
  if (error)
    return (
      <div className="co-error">
        ⚠️ {error} — you can still continue with home delivery.
      </div>
    );

  return (
    <div>
      <div className="hosp-picker-filters">
        <div className="hosp-search-wrap">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search hospital or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          )}
        </div>
        <select
          className="hosp-district-select"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          {districts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <p className="hosp-count">
        {filtered.length} hospital{filtered.length !== 1 ? "s" : ""}
        {district !== "All" ? ` in ${district}` : ""}
      </p>
      <div className="hosp-list">
        <div
          className={`hosp-card home-card${!selected ? " selected" : ""}`}
          onClick={() => onSelect(null)}
        >
          <div className="hosp-card-icon">🏠</div>
          <div className="hosp-card-info">
            <div className="hosp-card-name">Home Delivery Only</div>
            <div className="hosp-card-loc">
              No hospital visit — deliver medicines to my address
            </div>
          </div>
          {!selected && <div className="hosp-check">✓</div>}
        </div>
        {filtered.map((h) => {
          const isSelected = selected?.id === h.id;
          const availDocs = (h.doctors || []).filter((d) => d.available).length;
          return (
            <div
              key={h.id || h._id}
              className={`hosp-card${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(h)}
            >
              <div className="hosp-card-icon">🏥</div>
              <div className="hosp-card-info">
                <div className="hosp-card-name">{h.name}</div>
                <div className="hosp-card-loc">📍 {h.location}</div>
                <div className="hosp-card-meta">
                  <span className="hosp-tag">{h.type}</span>
                  <span className="hosp-tag">⭐ {h.rating}</span>
                  {h.emergency && (
                    <span className="hosp-tag">🚨 Emergency</span>
                  )}
                  <span className="hosp-tag green">
                    👨‍⚕️ {availDocs} available
                  </span>
                </div>
              </div>
              {isSelected && <div className="hosp-check">✓</div>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "#aaa",
              fontSize: 14,
            }}
          >
            🔍 No hospitals found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Razorpay Payment Component ─────────────────────
function PaymentSection({ orderId, onPaymentSuccess }) {
  const [payLoading, setPayLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState("");
  const [orderAmount, setOrderAmount] = useState(null);

  // ✅ FIX 1: Poll every 15s so Pay Now appears automatically when admin sets amount
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("userToken") ||
          localStorage.getItem("authToken");
        const res = await axios.get(`${API_BASE}/medicine-orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const o = res.data?.order;
        if (o && o.totalAmount > 0) {
          setOrderAmount(o.totalAmount + o.deliveryCharge);
        }
      } catch {
        // silently fail — amount may not be set yet
      }
    };

    if (!orderId) return;
    fetchOrder();
    // Poll every 15 seconds — Pay Now will appear automatically once admin sets amount
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handlePayment = async () => {
    setPayError("");
    setPayLoading(true);
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("authToken");

      // Step 1: Create Razorpay order
      const { data } = await axios.post(
        `${API_BASE}/payments/create-order`,
        { medicineOrderId: orderId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Step 2: Open Razorpay popup
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Medicine Order",
        description: `Order #${orderId}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verify = await axios.post(
              `${API_BASE}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                medicineOrderId: orderId,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (verify.data.success) {
              setPaid(true);
              onPaymentSuccess && onPaymentSuccess();
            }
          } catch {
            setPayError("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setPayError(`Payment failed: ${r.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setPayError(err?.response?.data?.message || "Payment initiation failed.");
    } finally {
      setPayLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="payment-paid-badge" style={{ margin: "0 auto 16px" }}>
        ✅ Payment Successful! Order Confirmed.
      </div>
    );
  }

  return (
    <div className="payment-box">
      <div className="payment-box-title">💳 Complete Payment</div>

      {/* ✅ FIX 2: Changed > 49 to > 0 so Pay Now shows as soon as admin sets any amount */}
      {orderAmount && orderAmount > 0 ? (
        <>
          <div className="payment-row">
            <span>Medicines</span>
            <span>₹{orderAmount - (orderAmount > 49 ? 49 : 0)}</span>
          </div>
          <div className="payment-row">
            <span>Delivery Charge</span>
            <span>₹{orderAmount > 49 ? 49 : 0}</span>
          </div>
          <div className="payment-row total">
            <span>Total</span>
            <span>₹{orderAmount}</span>
          </div>
          <br />
          {payError && (
            <div className="co-error" style={{ marginBottom: 12 }}>
              ⚠️ {payError}
            </div>
          )}
          <button
            className="btn-pay"
            onClick={handlePayment}
            disabled={payLoading}
          >
            {payLoading ? (
              <>
                <div className="spinner-white" /> Processing…
              </>
            ) : (
              `Pay ₹${orderAmount} with Razorpay`
            )}
          </button>
        </>
      ) : (
        <div className="payment-pending-note">
          ⏳ Our team is reviewing your prescription and will confirm the amount
          shortly. You'll be able to pay once the amount is set.
          <div style={{ marginTop: 8, fontSize: 12, color: "#b45309" }}>
            This page checks for updates every 15 seconds automatically.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Medicine() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [groupedHospitals, setGroupedHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [tabletImageFile, setTabletImageFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      setHospitalsLoading(true);
      setHospitalsError("");
      try {
        const res = await axios.get(`${API_BASE}/hospitals`);
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setGroupedHospitals(groupHospitalsByCity(raw));
      } catch (err) {
        setHospitalsError(
          !err.response
            ? "Cannot connect to server."
            : err.response?.data?.message || "Failed to load hospitals.",
        );
      } finally {
        setHospitalsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const handleNext0 = () => {
    if (!prescriptionFile && !tabletImageFile) {
      setUploadError(
        "Please upload at least one image — prescription or tablet photo.",
      );
      return;
    }
    if (
      (prescriptionFile && prescriptionFile.size > 5 * 1024 * 1024) ||
      (tabletImageFile && tabletImageFile.size > 5 * 1024 * 1024)
    ) {
      setUploadError("File size must be under 5MB.");
      return;
    }
    setUploadError("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !pincode) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        setError("You are not logged in. Please login first.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("patientName", name);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("pincode", pincode);
      formData.append("note", note);
      formData.append("orderType", "prescription_upload");

      if (selectedHospital) {
        formData.append(
          "hospitalId",
          selectedHospital.id || selectedHospital._id,
        );
        formData.append("hospitalName", selectedHospital.name);
        formData.append("hospitalLocation", selectedHospital.location);
        formData.append(
          "hospitalDistrict",
          selectedHospital.district || selectedHospital.city || "",
        );
      }
      if (prescriptionFile) formData.append("prescription", prescriptionFile);
      if (tabletImageFile) formData.append("tabletImage", tabletImageFile);

      const res = await axios.post(`${API_BASE}/medicine-orders`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderId(res.data?.orderId || res.data?.order?._id || "");
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Order failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="med-page">
        <div className="med-hero">
          <div className="med-hero-inner">
            <div className="med-hero-tag">💊 Medicine Delivery</div>
            <h1>
              Order medicines
              <br />
              <span>without the wait.</span>
            </h1>
            <p>
              Upload your prescription, choose a hospital, and get medicines
              delivered to your door in 2–4 hours.
            </p>
          </div>
        </div>

        <div className="med-body">
          <Steps current={step} />

          {/* ── Step 0: Upload ── */}
          {step === 0 && (
            <div className="med-card">
              <div className="med-card-title">Upload Your Images</div>
              <div className="med-card-sub">
                Upload a doctor's prescription and/or a photo of the medicine
                you need.
              </div>
              <div className="upload-grid">
                <div>
                  <div className="upload-section-label">📋 Prescription</div>
                  <UploadBox
                    label="Doctor's Prescription"
                    icon="📋"
                    accept="image/*,.pdf"
                    file={prescriptionFile}
                    onFile={setPrescriptionFile}
                    hint="JPG, PNG or PDF · Max 5MB"
                  />
                  {prescriptionFile && (
                    <button
                      className="upload-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrescriptionFile(null);
                      }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                <div>
                  <div className="upload-section-label">💊 Medicine Photo</div>
                  <UploadBox
                    label="Tablet / Medicine Photo"
                    icon="💊"
                    accept="image/*"
                    file={tabletImageFile}
                    onFile={setTabletImageFile}
                    hint="JPG or PNG · Max 5MB"
                  />
                  {tabletImageFile && (
                    <button
                      className="upload-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTabletImageFile(null);
                      }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>
              {uploadError && <div className="co-error">⚠️ {uploadError}</div>}
              <div className="upload-tips">
                <strong>💡 Tips for best results</strong>
                <ul>
                  <li>Make sure the prescription is clearly readable</li>
                  <li>Tablet image should show the name/strip clearly</li>
                  <li>Good lighting, no blur or shadows</li>
                </ul>
              </div>
              <button className="btn-primary" onClick={handleNext0}>
                Continue → Select Hospital
              </button>
            </div>
          )}

          {/* ── Step 1: Hospital ── */}
          {step === 1 && (
            <div className="med-card">
              <div className="med-card-title">Pick a Hospital</div>
              <div className="med-card-sub">
                Choose where you'd like to get treatment, or skip for home
                delivery only.
              </div>
              <HospitalPicker
                selected={selectedHospital}
                onSelect={setSelectedHospital}
                groupedHospitals={groupedHospitals}
                loading={hospitalsLoading}
                error={hospitalsError}
              />
              {selectedHospital && (
                <div className="hosp-selected-banner">
                  <span>🏥</span>
                  <div>
                    <strong>{selectedHospital.name}</strong>
                    <span>
                      📍 {selectedHospital.location} ·{" "}
                      {selectedHospital.district || selectedHospital.city}
                    </span>
                  </div>
                  <button onClick={() => setSelectedHospital(null)}>✕</button>
                </div>
              )}
              <div className="btn-row" style={{ marginTop: 24 }}>
                <button className="btn-secondary" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={() => setStep(2)}>
                  {selectedHospital
                    ? `Continue with ${selectedHospital.name.split(" ").slice(0, 2).join(" ")} →`
                    : "Continue with Home Delivery →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div className="med-card">
              <div className="med-card-title">Delivery Details</div>
              <div className="med-card-sub">
                Tell us where to deliver your medicines.
              </div>
              <div className="files-summary">
                {prescriptionFile && (
                  <div className="file-chip">📋 {prescriptionFile.name}</div>
                )}
                {tabletImageFile && (
                  <div className="file-chip">💊 {tabletImageFile.name}</div>
                )}
                {selectedHospital ? (
                  <div
                    className="file-chip"
                    style={{ background: "#e0f2fe", color: "#0369a1" }}
                  >
                    🏥 {selectedHospital.name.split(" ").slice(0, 3).join(" ")}
                  </div>
                ) : (
                  <div
                    className="file-chip"
                    style={{ background: "#f0fdf4", color: "#166534" }}
                  >
                    🏠 Home Delivery
                  </div>
                )}
                <button className="file-chip-edit" onClick={() => setStep(1)}>
                  ✏️ Change
                </button>
              </div>
              {error && <div className="co-error">⚠️ {error}</div>}
              <form className="co-form" onSubmit={handleSubmit}>
                <div className="co-row">
                  <div className="co-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="co-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>
                <div className="co-group">
                  <label>Delivery Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House no., Street, Area, City"
                    required
                    rows={3}
                  />
                </div>
                <div className="co-row">
                  <div className="co-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="600001"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="co-group">
                    <label>Additional Note</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Generic brand preferred"
                    />
                  </div>
                </div>
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" /> Placing Order…
                      </>
                    ) : (
                      "Place Order →"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Step 3: Success + Payment ── */}
          {step === 3 && (
            <div className="med-card">
              <div className="success-wrap">
                <div className="success-anim">{paymentDone ? "💳" : "✅"}</div>
                <h2>{paymentDone ? "Payment Done!" : "Order Placed!"}</h2>
                <p>
                  {paymentDone
                    ? "Your payment was successful and your order is confirmed."
                    : "We've received your prescription. Complete your payment below to confirm your order."}
                </p>

                {orderId && (
                  <div className="success-order-id">
                    Order ID: <strong>{orderId}</strong>
                  </div>
                )}

                {/* ── Payment Section ── */}
                {!paymentDone && orderId && (
                  <PaymentSection
                    orderId={orderId}
                    onPaymentSuccess={() => {
                      setPaymentDone(true);
                      setTimeout(() => navigate("/medicine-orders"), 3000);
                    }}
                  />
                )}

                <div className="success-steps">
                  <div className="success-step-item">
                    📋 Images received & under review
                  </div>
                  <div className="success-step-item">
                    💊 Medicines being prepared
                  </div>
                  {selectedHospital && (
                    <div className="success-step-item">
                      🏥 Hospital:{" "}
                      <strong style={{ marginLeft: 4 }}>
                        {selectedHospital.name}
                      </strong>
                    </div>
                  )}
                  <div className="success-step-item">
                    🚚 Out for delivery soon
                  </div>
                </div>

                <p className="success-redirect">
                  {paymentDone
                    ? "Redirecting to your orders in 3 seconds…"
                    : ""}
                </p>

                <button
                  className="btn-primary"
                  onClick={() => navigate("/medicine-orders")}
                >
                  View My Orders →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
