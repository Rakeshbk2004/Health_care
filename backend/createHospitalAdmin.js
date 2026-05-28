const mongoose = require("mongoose");
const Hospital = require("./models/hospital");
const bcrypt = require("bcryptjs");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");

    const hospitals = await Hospital.find({});
    console.log(`Found ${hospitals.length} hospitals`);

    for (const hospital of hospitals) {
      // Create admin email and password from hospital name
      const namePart = hospital.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 10);

      const adminEmail = `admin@${namePart}.com`;
      const password = `${namePart}@123`;
      const hashed = await bcrypt.hash(password, 10);

      await Hospital.findByIdAndUpdate(hospital._id, {
        adminName: `${hospital.name} Admin`,
        adminEmail: adminEmail,
        adminPassword: hashed,
        status: "approved",
      });

      console.log(`✅ ${hospital.name}`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${password}`);
      console.log("");
    }

    console.log("🎉 All hospital admins created successfully!");
    process.exit();
  })
  .catch((err) => {
    console.log("❌ Error:", err);
    process.exit(1);
  });
