// backend/seedLabTests.js
// Run: node seedLabTests.js
// Adds 7 default lab tests to every hospital that has none

const mongoose = require("mongoose");
const Hospital = require("./models/hospital");
require("dotenv").config();

const DEFAULT_TESTS = [
  {
    name: "CBC",
    price: 300,
    duration: "24 hrs",
    description: "Complete Blood Count — checks overall health",
    available: true,
  },
  {
    name: "Blood Sugar",
    price: 150,
    duration: "2 hrs",
    description: "Fasting & post-prandial blood glucose",
    available: true,
  },
  {
    name: "LFT",
    price: 500,
    duration: "24 hrs",
    description: "Liver Function Test",
    available: true,
  },
  {
    name: "RFT",
    price: 450,
    duration: "24 hrs",
    description: "Renal Function Test — kidney health",
    available: true,
  },
  {
    name: "Thyroid",
    price: 600,
    duration: "24 hrs",
    description: "TSH, T3, T4 thyroid panel",
    available: true,
  },
  {
    name: "Lipid Profile",
    price: 550,
    duration: "24 hrs",
    description: "Cholesterol, HDL, LDL, Triglycerides",
    available: true,
  },
  {
    name: "Urine",
    price: 100,
    duration: "4 hrs",
    description: "Routine urine analysis",
    available: true,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    const hospitals = await Hospital.find({ status: "approved" });
    let updated = 0;

    for (const h of hospitals) {
      if (!h.labTests || h.labTests.length === 0) {
        h.labTests = DEFAULT_TESTS;
        await h.save();
        updated++;
        console.log(`  ✅ Added tests to: ${h.name}`);
      } else {
        console.log(`  ⏩ Skipped (already has tests): ${h.name}`);
      }
    }

    console.log(`\n✅ Done! Updated ${updated} hospitals with lab tests.`);
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
