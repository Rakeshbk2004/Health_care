import "./index.css";

const doctors = [
  {
    name: "Dr. Sarah Lin",
    spec: "Cardiologist",
    rating: "4.9",
    reviews: 128,
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Dr. Mark Chen",
    spec: "Neurologist",
    rating: "4.8",
    reviews: 97,
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Dr. Priya Nair",
    spec: "Gynecologist",
    rating: "4.9",
    reviews: 215,
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Dr. James Osei",
    spec: "Pediatrician",
    rating: "4.7",
    reviews: 183,
    img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
  },
];

const services = [
  {
    id: "01",
    title: "Family Medicine",
    desc: "Total care for your inner circle. Prevention, early intervention, and ongoing treatment for all ages.",
  },
  {
    id: "02",
    title: "Women's Health",
    desc: "Specialized care from reproductive health to hormonal balance and preventive screenings.",
    featured: true,
  },
  {
    id: "03",
    title: "Cardiology",
    desc: "Heart health monitoring with advanced ECG, ultrasound, and minimally invasive procedures.",
  },
  {
    id: "04",
    title: "Pediatrics",
    desc: "Expert care for the little ones from day one — vaccinations, growth monitoring, and acute care.",
  },
  {
    id: "05",
    title: "Ultrasound & Lab",
    desc: "Precision diagnostics with AI-enhanced imaging and lightning-fast lab turnaround results.",
  },
  {
    id: "06",
    title: "Neurology",
    desc: "Comprehensive brain and nervous system care with advanced imaging and expert neurologists.",
  },
];

const facilities = [
  {
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    title: "Modern Reception",
    desc: "Stress-free, welcoming check-in environment.",
  },
  {
    img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    title: "Digital Lab",
    desc: "AI-powered diagnostics with 99% accuracy.",
  },
  {
    img: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    title: "Smart Surgery",
    desc: "Robotic-assisted sterile surgical suites.",
  },
  {
    img: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800",
    title: "Luxury Suites",
    desc: "Private rooms with 24/7 nursing care.",
  },
];

const testimonials = [
  {
    initials: "AM",
    color: "#1a6ef5",
    name: "Anika M.",
    role: "Cardiology Patient",
    text: "The care I received at SalvaMedic was exceptional. Dr. Lin's attention to detail and warmth made a stressful diagnosis feel manageable.",
  },
  {
    initials: "RK",
    color: "#0d9488",
    name: "Rajesh K.",
    role: "General Medicine",
    text: "From booking to discharge, everything was seamless. Lab results came back within hours and doctors explained everything clearly.",
  },
  {
    initials: "SP",
    color: "#7c3aed",
    name: "Sunita P.",
    role: "Women's Health Patient",
    text: "Dr. Nair and her team made my entire pregnancy journey comfortable and safe. I couldn't have asked for better support.",
  },
];

const Home = () => {
  return (
    <div className="sm-shell">
      {/* ─── HERO ─── */}
      <section className="sm-hero" id="home">
        <div className="sm-hero-left">
          <div className="sm-hero-tag">● Trusted Healthcare Since 2010</div>
          <h1 className="sm-hero-title">
            Innovation
            <br />
            <span>Clinic</span>
            <br />
            for All
          </h1>
          <p className="sm-hero-sub">
            We don't just treat symptoms. We care for{" "}
            <strong>human beings</strong> using the future of medicine —
            precise, compassionate, and always available.
          </p>

          <div className="sm-search">
            <input type="text" placeholder="Which specialist do you need?" />
            <button>Find Now</button>
          </div>

          <div className="sm-hero-btns">
            <button className="sm-btn-primary">Book a Consultation</button>
            <button className="sm-btn-ghost">View Our Doctors</button>
          </div>

          <div className="sm-trust">
            <div className="sm-avatars">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=100"
                alt="patient"
              />
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100"
                alt="patient"
              />
              <img
                src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100"
                alt="patient"
              />
            </div>
            <p>
              Trusted by <strong>2,000+</strong> patients this month
            </p>
          </div>
        </div>

        <div className="sm-hero-right">
          <div className="sm-hero-img-wrap">
            <div className="sm-circle-outer" />
            <div className="sm-circle-inner" />
            <img
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800"
              alt="Doctor"
              className="sm-hero-photo"
            />
            <div className="sm-stat-card sm-stat-card--top">
              <b>98%</b> Diagnostic Accuracy
            </div>
            <div className="sm-stat-card sm-stat-card--bot">
              <b>10y+</b> Clinical Experience
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div className="sm-stats-bar">
        {[
          { num: "15,000+", lbl: "Patients Treated" },
          { num: "120+", lbl: "Expert Specialists" },
          { num: "98%", lbl: "Success Rate" },
          { num: "24/7", lbl: "Emergency Care" },
        ].map((s) => (
          <div className="sm-stat-item" key={s.lbl}>
            <span className="sm-stat-num">{s.num}</span>
            <span className="sm-stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* ─── SERVICES ─── */}
      <section className="sm-section sm-services" id="services">
        <div className="sm-section-head">
          <div>
            <span className="sm-tag">Our Departments</span>
            <h2 className="sm-section-title">
              Specialized <span>Medical</span> Care
            </h2>
            <p className="sm-section-sub">
              Expert-led departments delivering precision diagnostics and
              compassionate treatment across all specialties.
            </p>
          </div>
          <button className="sm-btn-primary">View All Services</button>
        </div>

        <div className="sm-services-grid">
          {services.map((s) => (
            <div
              key={s.id}
              className={`sm-svc-card ${s.featured ? "sm-svc-card--featured" : ""}`}
            >
              <div className="sm-svc-num">{s.id}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="sm-svc-footer">
                <span className="sm-premium-lbl">Premium Care</span>
                <button className="sm-svc-arrow">→</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DOCTORS ─── */}
      <section className="sm-section sm-doctors" id="doctors">
        <div className="sm-section-head">
          <div>
            <span className="sm-tag">Our Team</span>
            <h2 className="sm-section-title">
              Meet Our <span>Expert</span> Doctors
            </h2>
            <p className="sm-section-sub">
              Board-certified specialists with decades of clinical excellence
              and patient-first care.
            </p>
          </div>
          <button className="sm-btn-primary">All Doctors</button>
        </div>

        <div className="sm-doctors-grid">
          {doctors.map((d) => (
            <div className="sm-doc-card" key={d.name}>
              <img src={d.img} alt={d.name} className="sm-doc-img" />
              <div className="sm-doc-info">
                <h4>{d.name}</h4>
                <div className="sm-doc-spec">{d.spec}</div>
                <div className="sm-doc-rating">
                  <span className="sm-stars">★★★★★</span> {d.rating} (
                  {d.reviews} reviews)
                </div>
                <div className="sm-doc-avail">
                  <span className="sm-dot-green" /> Available today
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FACILITIES ─── */}
      <section className="sm-facilities" id="facilities">
        <span className="sm-tag sm-tag--light">World-Class Infrastructure</span>
        <h2 className="sm-section-title sm-section-title--light">
          Hospital <span style={{ color: "#60a5fa" }}>Facilities</span>
        </h2>
        <p className="sm-section-sub sm-section-sub--light">
          State-of-the-art medical infrastructure designed for precision,
          comfort, and patient dignity.
        </p>

        <div className="sm-fac-grid">
          {facilities.map((f) => (
            <div className="sm-fac-item" key={f.title}>
              <img src={f.img} alt={f.title} />
              <div className="sm-fac-overlay">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="sm-section sm-testi">
        <div style={{ textAlign: "center" }}>
          <span className="sm-tag">Patient Stories</span>
          <h2 className="sm-section-title" style={{ textAlign: "center" }}>
            What Our <span>Patients</span> Say
          </h2>
        </div>

        <div className="sm-testi-grid">
          {testimonials.map((t) => (
            <div className="sm-testi-card" key={t.name}>
              <div className="sm-testi-stars">★★★★★</div>
              <p className="sm-testi-text">"{t.text}"</p>
              <div className="sm-testi-author">
                <div
                  className="sm-testi-avatar"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="sm-testi-name">{t.name}</div>
                  <div className="sm-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <div className="sm-cta">
        <div>
          <h2>Ready to prioritize your health?</h2>
          <p>Book a consultation today. Our specialists are ready for you.</p>
        </div>
        <div className="sm-cta-btns">
          <button className="sm-btn-white">Book Appointment</button>
          <button className="sm-btn-outline-white">Call Us Now</button>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="sm-footer">
        <div className="sm-footer-grid">
          <div className="sm-footer-brand">
            <div className="sm-brand" style={{ marginBottom: "0.8rem" }}>
              <div className="sm-logo">✚</div>
              <span className="sm-brand-name">SalvaMedic</span>
            </div>
            <p>
              Delivering compassionate, innovative healthcare to every patient
              who walks through our doors. Your health is our purpose.
            </p>
            <div className="sm-socials">
              {["f", "t", "in", "yt"].map((s) => (
                <div className="sm-social-btn" key={s}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {[
            {
              title: "Services",
              links: [
                "Family Medicine",
                "Cardiology",
                "Pediatrics",
                "Women's Health",
                "Neurology",
              ],
            },
            {
              title: "Hospital",
              links: [
                "About Us",
                "Our Doctors",
                "Facilities",
                "Careers",
                "News & Blog",
              ],
            },
            {
              title: "Contact",
              links: [
                "0-800-555-0199",
                "info@salvamedic.com",
                "123 Health Ave",
                "Mon–Fri: 8am–8pm",
                "Emergency: 24/7",
              ],
            },
          ].map((col) => (
            <div className="sm-footer-col" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sm-footer-bottom">
          <p>© 2025 SalvaMedic. All rights reserved.</p>
          <p>Privacy Policy · Terms of Service · Cookie Settings</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
