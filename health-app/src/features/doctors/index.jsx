// src/features/doctors/index.jsx
import { useNavigate } from "react-router-dom";
import "./index.css";

/* ─── Inline SVG illustrations ─────────────────────────────────────────── */

const StethoscopeSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#EBF4FF" />
    <circle cx="28" cy="22" r="7" fill="#90CAF9" />
    <circle cx="52" cy="22" r="7" fill="#90CAF9" />
    <path
      d="M28 29 Q28 46 40 50 Q52 54 54 46"
      stroke="#1565C0"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="54" cy="54" r="8" fill="#1976D2" />
    <circle cx="54" cy="54" r="4" fill="#BBDEFB" />
    <circle cx="28" cy="20" r="3" fill="#1565C0" />
    <circle cx="52" cy="20" r="3" fill="#1565C0" />
  </svg>
);

const PediatricianSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#FFF3E0" />
    <ellipse cx="40" cy="50" rx="16" ry="14" fill="#FFB74D" />
    <circle cx="40" cy="30" r="13" fill="#FFCC80" />
    <circle cx="36" cy="29" r="2" fill="#5D4037" />
    <circle cx="44" cy="29" r="2" fill="#5D4037" />
    <path
      d="M36 35 Q40 39 44 35"
      stroke="#5D4037"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="33" cy="33" r="3" fill="#FFAB91" opacity="0.6" />
    <circle cx="47" cy="33" r="3" fill="#FFAB91" opacity="0.6" />
    <ellipse
      cx="22"
      cy="52"
      rx="5"
      ry="8"
      fill="#FFB74D"
      transform="rotate(-15 22 52)"
    />
    <ellipse
      cx="58"
      cy="52"
      rx="5"
      ry="8"
      fill="#FFB74D"
      transform="rotate(15 58 52)"
    />
  </svg>
);

const DentistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#E8F5E9" />
    <path
      d="M26 28 C26 22 34 18 40 18 C46 18 54 22 54 28 C54 35 52 42 50 50 C49 54 47 58 45 58 C43 58 42 54 40 50 C38 54 37 58 35 58 C33 58 31 54 30 50 C28 42 26 35 26 28Z"
      fill="white"
      stroke="#A5D6A7"
      strokeWidth="2"
    />
    <path
      d="M32 24 Q35 20 40 20"
      stroke="#C8E6C9"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M30 30 Q31 27 33 26"
      stroke="#C8E6C9"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="55"
      y1="20"
      x2="62"
      y2="13"
      stroke="#388E3C"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="55" cy="22" r="5" fill="#66BB6A" opacity="0.8" />
  </svg>
);

const CardiologistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#FFEBEE" />
    <path
      d="M40 58 C40 58 18 44 18 30 C18 22 24 17 31 19 C35 20 38 23 40 26 C42 23 45 20 49 19 C56 17 62 22 62 30 C62 44 40 58 40 58Z"
      fill="#EF5350"
    />
    <path
      d="M40 52 C40 52 23 41 23 30 C23 25 27 21 31 22"
      stroke="#FFCDD2"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M14 40 L22 40 L26 32 L30 48 L34 36 L38 40 L44 40 L48 40 L52 33 L56 47 L60 40 L66 40"
      stroke="#C62828"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const OrthopedicSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#FFF8E1" />
    <rect x="33" y="18" width="14" height="44" rx="3" fill="#FFE082" />
    <circle cx="33" cy="20" r="8" fill="#FFD54F" />
    <circle cx="47" cy="20" r="8" fill="#FFD54F" />
    <circle cx="33" cy="60" r="8" fill="#FFD54F" />
    <circle cx="47" cy="60" r="8" fill="#FFD54F" />
    <rect
      x="36"
      y="22"
      width="8"
      height="36"
      rx="2"
      fill="#FFF9C4"
      opacity="0.7"
    />
    <circle cx="57" cy="23" r="10" fill="#F57F17" opacity="0.15" />
    <path
      d="M53 19 L61 27 M61 19 L53 27"
      stroke="#F57F17"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const DermatologistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#FCE4EC" />
    <ellipse cx="40" cy="42" rx="20" ry="24" fill="#FFCCBC" />
    <ellipse cx="40" cy="22" rx="20" ry="10" fill="#FF8A65" />
    <rect x="20" y="18" width="40" height="8" fill="#FF8A65" />
    <ellipse cx="33" cy="40" rx="3.5" ry="4" fill="white" />
    <ellipse cx="47" cy="40" rx="3.5" ry="4" fill="white" />
    <circle cx="33" cy="41" r="2" fill="#4E342E" />
    <circle cx="47" cy="41" r="2" fill="#4E342E" />
    <path
      d="M38 46 Q40 50 42 46"
      stroke="#FFAB91"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M34 54 Q40 58 46 54"
      stroke="#E91E63"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M60 18 L62 14 L64 18 L68 20 L64 22 L62 26 L60 22 L56 20Z"
      fill="#F48FB1"
    />
    <path
      d="M13 32 L14 29 L15 32 L18 33 L15 34 L14 37 L13 34 L10 33Z"
      fill="#F48FB1"
    />
  </svg>
);

const OphthalmologistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#E8EAF6" />
    <path
      d="M12 40 Q26 20 40 20 Q54 20 68 40 Q54 60 40 60 Q26 60 12 40Z"
      fill="white"
      stroke="#9FA8DA"
      strokeWidth="2"
    />
    <circle cx="40" cy="40" r="12" fill="#3F51B5" />
    <circle cx="40" cy="40" r="6" fill="#1A237E" />
    <circle cx="44" cy="36" r="3" fill="white" opacity="0.8" />
    <circle cx="36" cy="44" r="1.5" fill="white" opacity="0.4" />
    <path
      d="M24 32 L20 26"
      stroke="#5C6BC0"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M32 26 L30 20"
      stroke="#5C6BC0"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M40 24 L40 18"
      stroke="#5C6BC0"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M48 26 L50 20"
      stroke="#5C6BC0"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M56 32 L60 26"
      stroke="#5C6BC0"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ENTSvg = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#EDE7F6" />
    <path
      d="M38 18 C24 18 18 28 18 40 C18 52 24 60 34 62 C36 62 38 60 38 58 C38 56 36 54 34 52 C30 48 28 44 28 40 C28 30 32 26 38 26 C44 26 48 30 48 36 C48 40 46 44 42 46 C40 48 40 52 42 54 C44 56 46 52 46 48 C50 44 52 40 52 36 C52 26 46 18 38 18Z"
      fill="#CE93D8"
    />
    <path
      d="M38 26 C34 26 30 30 30 40 C30 46 32 50 36 54"
      stroke="#7B1FA2"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M58 26 Q64 33 64 40 Q64 47 58 54"
      stroke="#AB47BC"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M62 22 Q70 30 70 40 Q70 50 62 58"
      stroke="#CE93D8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const NeurologistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#FCE4EC" />
    <path
      d="M22 42 C18 36 18 24 26 20 C30 18 34 20 36 24 C38 20 42 18 46 20 C54 24 54 36 50 42 C48 46 44 52 40 56 C36 52 30 46 26 42 C24 44 22 44 22 42Z"
      fill="#F48FB1"
    />
    <path
      d="M40 24 L40 56"
      stroke="#E91E63"
      strokeWidth="1.5"
      strokeDasharray="3 2"
      fill="none"
    />
    <path
      d="M26 30 Q30 26 34 30"
      stroke="#E91E63"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M28 38 Q32 34 36 38"
      stroke="#E91E63"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M46 30 Q50 26 54 30"
      stroke="#E91E63"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M44 38 Q48 34 52 38"
      stroke="#E91E63"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="18" cy="22" r="3" fill="#EC407A" />
    <line x1="21" y1="22" x2="26" y2="26" stroke="#EC407A" strokeWidth="1.5" />
    <circle cx="62" cy="22" r="3" fill="#EC407A" />
    <line x1="59" y1="22" x2="54" y2="26" stroke="#EC407A" strokeWidth="1.5" />
    <circle cx="14" cy="42" r="3" fill="#EC407A" />
    <line x1="17" y1="42" x2="22" y2="42" stroke="#EC407A" strokeWidth="1.5" />
    <circle cx="66" cy="42" r="3" fill="#EC407A" />
    <line x1="63" y1="42" x2="58" y2="42" stroke="#EC407A" strokeWidth="1.5" />
  </svg>
);

const PsychiatristSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#E0F7FA" />
    <circle cx="40" cy="22" r="10" fill="#80DEEA" />
    <ellipse cx="40" cy="52" rx="18" ry="12" fill="#4DD0E1" />
    <path
      d="M22 52 Q18 56 20 60 Q24 62 28 58"
      stroke="#00838F"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M58 52 Q62 56 60 60 Q56 62 52 58"
      stroke="#00838F"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="24" cy="60" r="4" fill="#80DEEA" />
    <circle cx="56" cy="60" r="4" fill="#80DEEA" />
    <circle
      cx="40"
      cy="22"
      r="16"
      stroke="#B2EBF2"
      strokeWidth="1.5"
      strokeDasharray="4 3"
      fill="none"
    />
    <circle
      cx="40"
      cy="22"
      r="22"
      stroke="#E0F7FA"
      strokeWidth="1"
      strokeDasharray="3 4"
      fill="none"
    />
    <path
      d="M36 22 Q38 24 40 22"
      stroke="#006064"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 22 Q42 24 44 22"
      stroke="#006064"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const DiabetologistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#E1F5FE" />
    <rect x="24" y="22" width="32" height="40" rx="6" fill="#0288D1" />
    <rect x="28" y="26" width="24" height="20" rx="3" fill="#E1F5FE" />
    <polyline
      points="31,42 35,34 39,38 43,30 47,36 49,32"
      stroke="#0288D1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="32" cy="54" r="3" fill="#01579B" />
    <circle cx="40" cy="54" r="3" fill="#01579B" />
    <circle cx="48" cy="54" r="3" fill="#01579B" />
    <path
      d="M62 18 C62 18 56 26 56 30 C56 34 58.7 36 62 36 C65.3 36 68 34 68 30 C68 26 62 18 62 18Z"
      fill="#EF5350"
    />
    <path
      d="M59 32 Q62 34 65 32"
      stroke="#FFCDD2"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

const PhysiotherapistSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#F1F8E9" />
    <circle cx="52" cy="18" r="8" fill="#AED581" />
    <path
      d="M52 26 L46 44"
      stroke="#558B2F"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M52 32 L62 28"
      stroke="#558B2F"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M50 36 L40 38"
      stroke="#558B2F"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M46 44 L38 56"
      stroke="#558B2F"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M46 44 L54 58"
      stroke="#558B2F"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M38 56 L30 58"
      stroke="#558B2F"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M54 58 L62 56"
      stroke="#558B2F"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M18 28 L26 28"
      stroke="#C5E1A5"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M15 36 L24 36"
      stroke="#C5E1A5"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M18 44 L26 44"
      stroke="#C5E1A5"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ─── Speciality config ─────────────────────────────────────────────────── */

const SPECIALITIES = [
  {
    label: "General Physician",
    SVG: StethoscopeSVG,
    seedSpec: "General Physician",
  },
  { label: "Child Specialist", SVG: PediatricianSVG, seedSpec: "Pediatrician" },
  { label: "Dental Care", SVG: DentistSVG, seedSpec: "Dentist" },
  { label: "Heart", SVG: CardiologistSVG, seedSpec: "Cardiologist" },
  { label: "Bones & Joints", SVG: OrthopedicSVG, seedSpec: "Orthopedic" },
  { label: "Skin & Hair", SVG: DermatologistSVG, seedSpec: "Dermatologist" },
  {
    label: "Eye Specialist",
    SVG: OphthalmologistSVG,
    seedSpec: "Ophthalmologist",
  },
  { label: "Ear, Nose, Throat", SVG: ENTSvg, seedSpec: "ENT Specialist" },
  { label: "Brain & Nerves", SVG: NeurologistSVG, seedSpec: "Neurologist" },
  { label: "Mental Wellness", SVG: PsychiatristSVG, seedSpec: "Psychiatrist" },
  { label: "Diabetes", SVG: DiabetologistSVG, seedSpec: "Diabetologist" },
  {
    label: "Physiotherapy",
    SVG: PhysiotherapistSVG,
    seedSpec: "Physiotherapist",
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function Doctors() {
  const navigate = useNavigate();

  const handleSelect = (speciality) => {
    navigate("/hospitals", { state: { specFilter: speciality.seedSpec } });
  };

  return (
    <div className="doctors-app">
      <div className="dp-page">
        <div className="dp-page-header">
          <h2 className="dp-section-title">All Specialities</h2>
          <p className="dp-section-sub">
            Select a speciality to find available doctors
          </p>
        </div>
        <div className="spec-grid">
          {SPECIALITIES.map((s, i) => (
            <button
              key={s.label}
              className="spec-card"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => handleSelect(s)}
            >
              <div className="spec-card-img">
                <s.SVG />
              </div>
              <span className="spec-card-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
