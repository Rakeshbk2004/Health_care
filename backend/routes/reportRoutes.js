const express = require("express");
const router = express.Router();
const Report = require("../models/report");
const auth = require("../middleware/auth");

// ✅ POST /api/reports — Save report
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, fileUrl, fileName, fileType, category } =
      req.body;

    if (!title || !fileUrl || !fileName) {
      return res
        .status(400)
        .json({ message: "Title and file are required ❌" });
    }

    const report = new Report({
      userEmail: req.user.email,
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      category,
    });

    await report.save();

    res.status(201).json({ message: "Report saved ✅", report });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ✅ GET /api/reports — Get user's reports
router.get("/", auth, async (req, res) => {
  try {
    const reports = await Report.find({ userEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ✅ DELETE /api/reports/:id — Delete report
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found ❌" });
    }

    if (report.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    await report.deleteOne();
    res.json({ message: "Report deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
});

module.exports = router;
