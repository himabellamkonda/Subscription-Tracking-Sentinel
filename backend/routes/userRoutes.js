const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${req.params.userId}-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.put(
  "/upload-profile/:userId",
  upload.single("profile"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { profileImage: `/uploads/${req.file.filename}` },
        { new: true }
      );

      res.json({ success: true, profileImage: user.profileImage });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  }
);

module.exports = router;
