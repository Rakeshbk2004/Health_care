// LabTests/index.jsx
import { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./index.css";

const karnatakaLabs = [
  {
    id: "blr-1",
    name: "Apollo Diagnostics",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "MG Road, Bangalore - 560001",
    phone: "080-41234567",
    tests: [
      "CBC",
      "LFT",
      "RFT",
      "Thyroid",
      "Lipid Profile",
      "ECG",
      "Diabetes",
      "Vitamin D",
      "Hormones",
      "PCR",
      "Culture",
      "Allergy",
    ],
    price_range: "₹300–₹2500",
    rating: 4.7,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "blr-2",
    name: "Thyrocare Wellness",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Indiranagar, Bangalore - 560038",
    phone: "080-42345678",
    tests: ["CBC", "Thyroid", "Diabetes", "Vitamin D", "Lipid Profile", "LFT"],
    price_range: "₹199–₹1800",
    rating: 4.5,
    open: "6AM–10PM",
    home_collection: true,
  },
  {
    id: "blr-3",
    name: "Metropolis Healthcare",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Koramangala, Bangalore - 560034",
    phone: "080-43456789",
    tests: ["CBC", "LFT", "RFT", "Culture", "PCR", "Thyroid", "Allergy"],
    price_range: "₹250–₹3000",
    rating: 4.6,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "blr-4",
    name: "SRL Diagnostics",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Jayanagar, Bangalore - 560041",
    phone: "080-44567890",
    tests: ["CBC", "LFT", "Thyroid", "Lipid Profile", "ECG", "Diabetes"],
    price_range: "₹300–₹2200",
    rating: 4.4,
    open: "7AM–8PM",
    home_collection: true,
  },
  {
    id: "blr-5",
    name: "Neuberg Diagnostics",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Whitefield, Bangalore - 560066",
    phone: "080-45678901",
    tests: [
      "CBC",
      "PCR",
      "Culture",
      "Genetics",
      "Hormones",
      "Thyroid",
      "LFT",
      "RFT",
    ],
    price_range: "₹400–₹5000",
    rating: 4.8,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "blr-6",
    name: "Vijaya Diagnostics",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Rajajinagar, Bangalore - 560010",
    phone: "080-46789012",
    tests: ["CBC", "ECG", "LFT", "RFT", "Thyroid", "Urine", "Stool"],
    price_range: "₹200–₹2000",
    rating: 4.3,
    open: "7AM–8PM",
    home_collection: false,
  },
  {
    id: "blr-7",
    name: "Redcliffe Labs",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Electronic City, Bangalore - 560100",
    phone: "080-48901234",
    tests: ["CBC", "LFT", "Vitamin D", "Diabetes", "Thyroid", "Allergy"],
    price_range: "₹149–₹1500",
    rating: 4.5,
    open: "6AM–10PM",
    home_collection: true,
  },
  {
    id: "blr-8",
    name: "Pathkind Diagnostics",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "BTM Layout, Bangalore - 560076",
    phone: "080-49012345",
    tests: ["CBC", "Allergy", "Thyroid", "Lipid Profile", "Culture"],
    price_range: "₹250–₹2500",
    rating: 4.4,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "blr-9",
    name: "HealthSprint Labs",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "Yelahanka, Bangalore - 560064",
    phone: "080-40123456",
    tests: ["CBC", "LFT", "RFT", "Urine", "Stool", "Diabetes"],
    price_range: "₹200–₹1800",
    rating: 4.2,
    open: "7AM–8PM",
    home_collection: true,
  },
  {
    id: "blr-10",
    name: "Cloudnine Diagnostics",
    city: "Bangalore",
    district: "Bangalore Urban",
    address: "HSR Layout, Bangalore - 560102",
    phone: "080-47890123",
    tests: ["CBC", "Hormones", "Fertility", "Thyroid", "LFT"],
    price_range: "₹350–₹3500",
    rating: 4.6,
    open: "8AM–8PM",
    home_collection: true,
  },
  {
    id: "blrr-1",
    name: "Devanahalli Diagnostics",
    city: "Devanahalli",
    district: "Bangalore Rural",
    address: "Main Road, Devanahalli - 562110",
    phone: "080-27711001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Urine"],
    price_range: "₹150–₹1500",
    rating: 4.1,
    open: "8AM–7PM",
    home_collection: false,
  },
  {
    id: "blrr-2",
    name: "Hoskote Diagnostic Centre",
    city: "Hoskote",
    district: "Bangalore Rural",
    address: "Old Madras Rd, Hoskote - 562114",
    phone: "080-27944004",
    tests: ["CBC", "Thyroid", "Lipid Profile", "Diabetes"],
    price_range: "₹150–₹1500",
    rating: 4.0,
    open: "8AM–7PM",
    home_collection: false,
  },
  {
    id: "blrr-3",
    name: "Nelamangala Care Lab",
    city: "Nelamangala",
    district: "Bangalore Rural",
    address: "Tumkur Road, Nelamangala - 562123",
    phone: "080-27733003",
    tests: ["CBC", "LFT", "Stool", "Urine"],
    price_range: "₹120–₹1400",
    rating: 4.0,
    open: "8AM–7PM",
    home_collection: false,
  },
  {
    id: "blrr-4",
    name: "Kanakapura Path Lab",
    city: "Kanakapura",
    district: "Bangalore Rural",
    address: "Main Bazaar, Kanakapura - 562117",
    phone: "080-27555005",
    tests: ["CBC", "LFT", "Diabetes", "Vitamin D"],
    price_range: "₹130–₹1300",
    rating: 3.8,
    open: "8AM–6PM",
    home_collection: false,
  },
  {
    id: "blrr-5",
    name: "Ramanagara Diagnostics",
    city: "Ramanagara",
    district: "Bangalore Rural",
    address: "Mysore Road, Ramanagara - 562159",
    phone: "080-27277007",
    tests: ["CBC", "Thyroid", "ECG", "LFT"],
    price_range: "₹150–₹1600",
    rating: 4.1,
    open: "8AM–7PM",
    home_collection: false,
  },
  {
    id: "mys-1",
    name: "Vikram Diagnostics",
    city: "Mysore",
    district: "Mysore",
    address: "Sayyaji Rao Rd, Mysore - 570001",
    phone: "0821-4001001",
    tests: [
      "CBC",
      "LFT",
      "RFT",
      "Thyroid",
      "Lipid Profile",
      "ECG",
      "Hormones",
      "PCR",
    ],
    price_range: "₹200–₹2000",
    rating: 4.5,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "mys-2",
    name: "Apollo Diagnostics Mysore",
    city: "Mysore",
    district: "Mysore",
    address: "Srirampura, Mysore - 570023",
    phone: "0821-4005005",
    tests: ["CBC", "LFT", "Lipid Profile", "ECG", "Thyroid", "Diabetes"],
    price_range: "₹250–₹2200",
    rating: 4.5,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "mys-3",
    name: "Manipal Diagnostics Mysore",
    city: "Mysore",
    district: "Mysore",
    address: "Kuvempunagar, Mysore - 570023",
    phone: "0821-4004004",
    tests: ["CBC", "PCR", "Genetics", "Hormones", "Culture", "LFT", "RFT"],
    price_range: "₹300–₹4000",
    rating: 4.6,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "mys-4",
    name: "Thyrocare Mysore",
    city: "Mysore",
    district: "Mysore",
    address: "Vijayanagar, Mysore - 570017",
    phone: "0821-4002002",
    tests: ["CBC", "Thyroid", "Vitamin D", "Diabetes", "Allergy"],
    price_range: "₹199–₹1800",
    rating: 4.3,
    open: "6AM–9PM",
    home_collection: true,
  },
  {
    id: "mys-5",
    name: "Neuberg Mysore",
    city: "Mysore",
    district: "Mysore",
    address: "Bannimantap, Mysore - 570015",
    phone: "0821-4009009",
    tests: ["CBC", "PCR", "Culture", "RFT", "Genetics"],
    price_range: "₹300–₹3000",
    rating: 4.4,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "mng-1",
    name: "KMC Diagnostics",
    city: "Mangalore",
    district: "Dakshina Kannada",
    address: "Attavar, Mangalore - 575001",
    phone: "0824-4101001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Lipid Profile", "ECG"],
    price_range: "₹250–₹2500",
    rating: 4.6,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "mng-2",
    name: "Manipal Diagnostics Mangalore",
    city: "Mangalore",
    district: "Dakshina Kannada",
    address: "Falnir, Mangalore - 575001",
    phone: "0824-4102002",
    tests: ["CBC", "Genetics", "PCR", "Culture", "Hormones", "LFT"],
    price_range: "₹350–₹4000",
    rating: 4.7,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "hbl-1",
    name: "Apollo Diagnostics Hubli",
    city: "Hubli",
    district: "Dharwad",
    address: "Keshwapur, Hubli - 580023",
    phone: "0836-4201001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Lipid Profile", "Diabetes"],
    price_range: "₹200–₹2000",
    rating: 4.4,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "hbl-2",
    name: "KLE Diagnostics Hubli",
    city: "Hubli",
    district: "Dharwad",
    address: "Vidyanagar, Hubli - 580031",
    phone: "0836-4205005",
    tests: ["CBC", "ECG", "LFT", "Genetics", "PCR", "Hormones"],
    price_range: "₹300–₹3000",
    rating: 4.5,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "blg-1",
    name: "Apollo Diagnostics Belagavi",
    city: "Belagavi",
    district: "Belagavi",
    address: "Tilakwadi, Belagavi - 590006",
    phone: "0831-4301001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Lipid Profile", "Allergy"],
    price_range: "₹200–₹2000",
    rating: 4.4,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "klb-1",
    name: "Apollo Diagnostics Kalaburagi",
    city: "Kalaburagi",
    district: "Kalaburagi",
    address: "Supermarket, Kalaburagi - 585101",
    phone: "08472-231001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Diabetes", "Lipid Profile"],
    price_range: "₹200–₹2000",
    rating: 4.3,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "udp-1",
    name: "Manipal Diagnostics Udupi",
    city: "Manipal",
    district: "Udupi",
    address: "Manipal, Udupi - 576104",
    phone: "0820-4202002",
    tests: ["CBC", "Genetics", "PCR", "Hormones", "Culture", "Fertility"],
    price_range: "₹350–₹4000",
    rating: 4.6,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "hsn-1",
    name: "Apollo Diagnostics Hassan",
    city: "Hassan",
    district: "Hassan",
    address: "BM Road, Hassan - 573201",
    phone: "08172-231001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Lipid Profile"],
    price_range: "₹150–₹1800",
    rating: 4.3,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "tmk-1",
    name: "Apollo Diagnostics Tumakuru",
    city: "Tumakuru",
    district: "Tumakuru",
    address: "SS Puram, Tumakuru - 572102",
    phone: "0816-4401001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Lipid Profile", "ECG"],
    price_range: "₹200–₹2000",
    rating: 4.3,
    open: "7AM–9PM",
    home_collection: true,
  },
  {
    id: "shg-1",
    name: "Apollo Diagnostics Shivamogga",
    city: "Shivamogga",
    district: "Shivamogga",
    address: "Vinoba Nagar, Shivamogga - 577201",
    phone: "08182-231001",
    tests: ["CBC", "LFT", "RFT", "Thyroid", "Lipid Profile", "Diabetes"],
    price_range: "₹200–₹2000",
    rating: 4.3,
    open: "7AM–9PM",
    home_collection: true,
  },
];

const ALL_DISTRICTS = [
  "All",
  ...Array.from(new Set(karnatakaLabs.map((l) => l.district))).sort(),
];
const STEPS = ["LAB", "TESTS", "TIME", "REVIEW"];
const TIME_SLOTS = [
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
];

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("jwt") ||
  sessionStorage.getItem("token") ||
  null;

const Stars = ({ rating }) => (
  <span className="stars">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        style={{ color: i < Math.round(rating) ? "#f59e0b" : "#d1d5db" }}
      >
        ★
      </span>
    ))}
    <span className="rating-num">{rating}</span>
  </span>
);

export default function LabTests() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("All");
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [collectionType, setCollectionType] = useState("walk-in");

  const [bookingDone, setBookingDone] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const filteredLabs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return karnatakaLabs.filter((lab) => {
      const matchDistrict = district === "All" || lab.district === district;
      const matchQuery =
        !q ||
        lab.name.toLowerCase().includes(q) ||
        lab.city.toLowerCase().includes(q) ||
        lab.district.toLowerCase().includes(q) ||
        lab.address.toLowerCase().includes(q) ||
        lab.tests.some((t) => t.toLowerCase().includes(q));
      return matchDistrict && matchQuery;
    });
  }, [searchQuery, district]);

  const toggleTest = (test) =>
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test],
    );

  const handleSelectLab = (lab) => {
    setSelectedLab(lab);
    setSelectedTests([]);
    setSelectedTime("");
    setCollectionType("walk-in");
    setBookingError("");
    setStep(1);
    window.scrollTo(0, 0);
  };

  // ✅ Confirm booking → save to backend → redirect to history
  const handleConfirm = async () => {
    setBookingLoading(true);
    setBookingError("");

    const token = getToken();
    if (!token) {
      setBookingError("Please login first to book.");
      setBookingLoading(false);
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    try {
      await axios.post(
        "https://health-care-0irv.onrender.com/api/bookings/lab-tests",
        {
          labId: selectedLab.id,
          labName: selectedLab.name,
          labAddress: selectedLab.address,
          labPhone: selectedLab.phone,
          city: selectedLab.city,
          district: selectedLab.district,
          tests: selectedTests,
          date: today,
          timeSlot: selectedTime,
          collectionType,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBookingDone(true);

      // ✅ Redirect to history after 3 seconds
      setTimeout(() => navigate("/booking-history"), 3000);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "";

      if (status === 401) {
        setBookingError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (status === 400) {
        setBookingError(msg || "Invalid booking details.");
      } else {
        setBookingError(msg || "Booking failed. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelectedLab(null);
    setSelectedTests([]);
    setSelectedTime("");
    setCollectionType("walk-in");
    setBookingDone(false);
    setBookingError("");
    setSearchQuery("");
    setDistrict("All");
  };

  const canGoToStep = (t) => {
    if (t === 0) return true;
    if (t === 1) return !!selectedLab;
    if (t === 2) return !!selectedLab && selectedTests.length > 0;
    if (t === 3)
      return !!selectedLab && selectedTests.length > 0 && !!selectedTime;
    return false;
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="lt-wrapper">
      {/* STEPPER */}
      <div className="lt-stepper">
        {STEPS.map((label, i) => (
          <div key={label} className="lt-step-group">
            {i > 0 && (
              <div className={`lt-step-line ${i <= step ? "done" : ""}`} />
            )}
            <div className="lt-step-inner">
              <button
                className={`lt-step-btn ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
                onClick={() => canGoToStep(i) && setStep(i)}
                disabled={!canGoToStep(i)}
              >
                {i < step ? "✓" : i + 1}
              </button>
              <span className={`lt-step-label ${i === step ? "active" : ""}`}>
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── STEP 0: FIND LAB ── */}
      {step === 0 && (
        <div className="lt-section">
          <h2 className="lt-title">Find a Diagnostics Center</h2>
          <p className="lt-sub">
            Search from {karnatakaLabs.length}+ verified labs across Karnataka
          </p>

          <div className="lt-search-layout">
            <div className="lt-search-col">
              <div className="lt-search-box">
                <span className="lt-search-icon">🔍</span>
                <input
                  className="lt-search-input"
                  type="text"
                  placeholder="Search labs, cities, districts, or tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="lt-clear-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              <p className="lt-result-count">
                {filteredLabs.length} lab{filteredLabs.length !== 1 ? "s" : ""}{" "}
                found
              </p>

              <div className="lt-lab-list">
                {filteredLabs.length === 0 ? (
                  <div className="lt-empty">
                    No labs found. Try a different search or district.
                  </div>
                ) : (
                  filteredLabs.map((lab) => (
                    <div key={lab.id} className="lt-lab-card">
                      <div className="lt-lab-header">
                        <div>
                          <div className="lt-lab-name">{lab.name}</div>
                          <div className="lt-lab-city">
                            {lab.city} · {lab.district}
                          </div>
                        </div>
                        <Stars rating={lab.rating} />
                      </div>
                      <div className="lt-lab-address">📍 {lab.address}</div>
                      <div className="lt-lab-meta">
                        <span>🕐 {lab.open}</span>
                        <span>📞 {lab.phone}</span>
                        <span>
                          {lab.home_collection
                            ? "🏠 Home Collection"
                            : "🏥 Walk-in Only"}
                        </span>
                        <span className="lt-price">{lab.price_range}</span>
                      </div>
                      <div className="lt-lab-tests-preview">
                        {lab.tests.slice(0, 6).map((t) => (
                          <span key={t} className="lt-test-pill">
                            {t}
                          </span>
                        ))}
                        {lab.tests.length > 6 && (
                          <span className="lt-test-pill lt-more">
                            +{lab.tests.length - 6} more
                          </span>
                        )}
                      </div>
                      <button
                        className="lt-select-btn"
                        onClick={() => handleSelectLab(lab)}
                      >
                        Select Lab →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lt-district-col">
              <div className="lt-district-label">City / District</div>
              <div className="lt-district-list">
                {ALL_DISTRICTS.map((d) => (
                  <button
                    key={d}
                    className={`lt-district-btn ${district === d ? "active" : ""}`}
                    onClick={() => setDistrict(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: SELECT TESTS ── */}
      {step === 1 && selectedLab && (
        <div className="lt-section">
          <button className="lt-back-link" onClick={() => setStep(0)}>
            ← Back to Labs
          </button>
          <h2 className="lt-title">Select Tests</h2>

          <div className="lt-selected-lab-banner">
            <div>
              <strong>{selectedLab.name}</strong>
              <span className="lt-banner-sub">
                {" "}
                · {selectedLab.city}, {selectedLab.district}
              </span>
            </div>
            <span className="lt-banner-price">{selectedLab.price_range}</span>
          </div>

          <div className="lt-tests-header">
            <p className="lt-sub">
              {selectedLab.tests.length} tests available
              {selectedTests.length > 0 && (
                <strong> · {selectedTests.length} selected</strong>
              )}
            </p>
            <div className="lt-test-actions">
              <button
                className="lt-tag-action"
                onClick={() => setSelectedTests([...selectedLab.tests])}
              >
                Select All
              </button>
              <button
                className="lt-tag-action lt-tag-clear"
                onClick={() => setSelectedTests([])}
                disabled={selectedTests.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="lt-test-grid">
            {selectedLab.tests.map((test) => {
              const isSelected = selectedTests.includes(test);
              return (
                <button
                  key={test}
                  className={`lt-test-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleTest(test)}
                  type="button"
                >
                  <span className="lt-test-check">{isSelected ? "✓" : ""}</span>
                  <span className="lt-test-name">{test}</span>
                </button>
              );
            })}
          </div>

          {selectedTests.length > 0 && (
            <div className="lt-selected-summary">
              <strong>Selected tests:</strong>
              <div className="lt-selected-chips">
                {selectedTests.map((t) => (
                  <span key={t} className="lt-selected-chip">
                    {t}
                    <button
                      className="lt-chip-remove"
                      onClick={() => toggleTest(t)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            className="lt-next-btn"
            disabled={selectedTests.length === 0}
            onClick={() => setStep(2)}
          >
            Continue to Time Slot →
          </button>
        </div>
      )}

      {/* ── STEP 2: CHOOSE TIME ── */}
      {step === 2 && selectedLab && (
        <div className="lt-section">
          <button className="lt-back-link" onClick={() => setStep(1)}>
            ← Back to Tests
          </button>
          <h2 className="lt-title">Choose a Time Slot</h2>

          <div className="lt-selected-lab-banner">
            <strong>{selectedLab.name}</strong>
            <span className="lt-banner-sub">
              {" "}
              · {selectedTests.length} test
              {selectedTests.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          {selectedLab.home_collection && (
            <div className="lt-collection-toggle">
              <button
                className={`lt-toggle-btn ${collectionType === "walk-in" ? "active" : ""}`}
                onClick={() => setCollectionType("walk-in")}
              >
                🏥 Walk-in
              </button>
              <button
                className={`lt-toggle-btn ${collectionType === "home" ? "active" : ""}`}
                onClick={() => setCollectionType("home")}
              >
                🏠 Home Collection
              </button>
            </div>
          )}

          <p className="lt-sub">
            Available slots for <strong>{todayStr}</strong>
          </p>

          <div className="lt-time-grid">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <button
                  key={slot}
                  className={`lt-time-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedTime(slot)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          borderColor: "#2563eb",
                          fontWeight: 600,
                        }
                      : {}
                  }
                >
                  {isSelected && <span style={{ marginRight: 4 }}>✓</span>}
                  {slot}
                </button>
              );
            })}
          </div>

          {selectedTime && (
            <div className="lt-time-selected-info">
              ✅ Selected: <strong>{selectedTime}</strong>
              {collectionType === "home" ? " · Home Collection" : " · Walk-in"}
            </div>
          )}

          <button
            className="lt-next-btn"
            disabled={!selectedTime}
            onClick={() => setStep(3)}
          >
            Review Booking →
          </button>
        </div>
      )}

      {/* ── STEP 3: REVIEW & CONFIRM ── */}
      {step === 3 && selectedLab && (
        <div className="lt-section">
          {!bookingDone ? (
            <>
              <button className="lt-back-link" onClick={() => setStep(2)}>
                ← Back to Time
              </button>
              <h2 className="lt-title">Review Your Booking</h2>

              <div className="lt-review-card">
                {[
                  ["Lab", selectedLab.name],
                  ["Location", selectedLab.address],
                  ["Phone", selectedLab.phone],
                  ["Date", todayStr],
                  ["Time", selectedTime],
                  [
                    "Collection",
                    collectionType === "home"
                      ? "🏠 Home Collection"
                      : "🏥 Walk-in",
                  ],
                  ["Price Range", selectedLab.price_range],
                ].map(([label, val]) => (
                  <div key={label} className="lt-review-row">
                    <span className="lt-review-label">{label}</span>
                    <span
                      className={`lt-review-val ${label === "Price Range" ? "lt-green" : ""}`}
                    >
                      {val}
                    </span>
                  </div>
                ))}
                <div className="lt-review-row lt-review-tests">
                  <span className="lt-review-label">
                    Tests ({selectedTests.length})
                  </span>
                  <div className="lt-review-test-list">
                    {selectedTests.map((t) => (
                      <span key={t} className="lt-test-pill">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {bookingError && (
                <div
                  style={{
                    margin: "12px 0",
                    padding: "10px 16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "0.9rem",
                  }}
                >
                  ⚠️ {bookingError}
                </div>
              )}

              <button
                className="lt-next-btn lt-confirm-btn"
                onClick={handleConfirm}
                disabled={bookingLoading}
              >
                {bookingLoading ? "Saving…" : "✓ Confirm Booking"}
              </button>
            </>
          ) : (
            /* ── SUCCESS SCREEN ── */
            <div className="lt-success">
              <div className="lt-success-icon">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>
                Your appointment at <strong>{selectedLab.name}</strong> is
                confirmed for <strong>{selectedTime}</strong>.
              </p>
              <p className="lt-success-sub">
                ✅ Saved to your history. Redirecting in 3 seconds…
              </p>
              <div className="lt-success-tests">
                {selectedTests.map((t) => (
                  <span key={t} className="lt-test-pill">
                    {t}
                  </span>
                ))}
              </div>
              <button
                className="lt-next-btn"
                onClick={() => navigate("/booking-history")}
              >
                View History →
              </button>
              <button
                className="lt-next-btn"
                style={{
                  marginTop: 8,
                  background: "#f1f5f9",
                  color: "#334155",
                }}
                onClick={handleReset}
              >
                Book Another Test
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
