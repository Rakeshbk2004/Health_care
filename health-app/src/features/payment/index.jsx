import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./index.css";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "📱", desc: "Pay via UPI ID" },
  { id: "card", label: "Card", icon: "💳", desc: "Credit / Debit Card" },
  { id: "cash", label: "Cash", icon: "💵", desc: "Pay at counter" },
];

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  if (!state) {
    return (
      <div className="payment-bg">
        <div className="payment-card">
          <h2>No Payment Data ❌</h2>
          <button className="pay-btn" onClick={() => navigate("/tests")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (!method) {
      setError("Please select a payment method ❌");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://health-care-0irv.onrender.com/api/payments",
        {
          name: state.name,
          price: state.price,
          type: state.type,
          method,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setTransactionId(res.data.payment.transactionId);
      setSuccess(true);

      setTimeout(() => {
        navigate("/booking-history");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-bg">
      <div className="payment-card">
        {!success ? (
          <>
            {/* TITLE */}
            <div className="payment-header">
              <h2 className="title">Complete Payment</h2>
              <p className="payment-subtitle">Secure & Fast Payment</p>
            </div>

            {/* INFO BOX */}
            <div className="info-box">
              <span className="type-badge">{state.type}</span>
              <h3 className="name">{state.name}</h3>
              <h1 className="price">₹ {state.price}</h1>
            </div>

            {/* PAYMENT METHODS */}
            <div className="method-section">
              <p className="method-title">Select Payment Method</p>
              <div className="method-list">
                {PAYMENT_METHODS.map((m) => (
                  <div
                    key={m.id}
                    className={`method-item ${method === m.id ? "method-active" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <span className="method-icon">{m.icon}</span>
                    <div>
                      <p className="method-label">{m.label}</p>
                      <p className="method-desc">{m.desc}</p>
                    </div>
                    <div className="method-radio">
                      {method === m.id && <div className="method-radio-dot" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ERROR */}
            {error && <p className="pay-error">{error}</p>}

            {/* PAY BUTTON */}
            <button className="pay-btn" onClick={handlePay} disabled={loading}>
              {loading ? "Processing..." : `Pay ₹ ${state.price}`}
            </button>

            {/* SECURE NOTE */}
            <p className="secure-note">🔒 100% Secure Payment</p>
          </>
        ) : (
          /* SUCCESS SCREEN */
          <div className="success-screen">
            <div className="success-icon">🎉</div>
            <h2 className="success">Payment Successful!</h2>
            <p className="success-amount">₹ {state.price} paid</p>
            <div className="txn-box">
              <p className="txn-label">Transaction ID</p>
              <p className="txn-id">{transactionId}</p>
            </div>
            <p className="redirect">Redirecting to Booking History...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
