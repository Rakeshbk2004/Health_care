// src/components/AdminUI.jsx

export function StatCard({ icon, label, value, color = "#6366f1", sub }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        border: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: "#0f172a",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div>
        <h1
          style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    Pending: { bg: "#fef9c3", color: "#854d0e" },
    Confirmed: { bg: "#dcfce7", color: "#166534" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b" },
    Completed: { bg: "#e0e7ff", color: "#3730a3" },
    approved: { bg: "#dcfce7", color: "#166534" },
    pending: { bg: "#fef9c3", color: "#854d0e" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
    confirmed: { bg: "#dcfce7", color: "#166534" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    user: { bg: "#f1f5f9", color: "#475569" },
    admin: { bg: "#e0e7ff", color: "#3730a3" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  color = "#6366f1",
  disabled,
  small,
  outline,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "5px 12px" : "9px 18px",
        background: outline ? "white" : disabled ? "#e2e8f0" : color,
        color: outline ? color : disabled ? "#94a3b8" : "white",
        border: outline ? `1.5px solid ${color}` : "none",
        borderRadius: 8,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: "#475569",
            fontWeight: 500,
            display: "block",
            marginBottom: 5,
          }}
        >
          {label}
          {required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "9px 12px",
          border: "1.5px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 13,
          color: "#0f172a",
          boxSizing: "border-box",
          outline: "none",
          background: "white",
        }}
      />
    </div>
  );
}

export function Table({ headers, rows, emptyMsg = "No data found" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr
            style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
          >
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "12px 16px",
                      color: "#334155",
                      verticalAlign: "middle",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        color: "#94a3b8",
      }}
    >
      <span style={{ fontSize: 14 }}>Loading…</span>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div style={{ position: "relative", width: 260 }}>
      <span
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        🔍
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 12px 8px 30px",
          border: "1.5px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 13,
          color: "#0f172a",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
    </div>
  );
}
