const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* ===========================
   REGISTER API
=========================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "user" // default user
    });

    await user.save();

    res.json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


/* ===========================
   LOGIN API (USER + ADMIN)
=========================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (String(user.password) !== String(password)) {
      return res.json({
        success: false,
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,           // ✅ IMPORTANT
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


/* ===========================
   UPDATE PROFILE PICTURE
=========================== */
router.put("/profile-pic/:id", async (req, res) => {
  try {
    const { profilePic } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic },
      { new: true }
    );

    res.json({
      success: true,
      profilePic: user.profilePic
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


/* ===========================
   GET PROFILE PICTURE
=========================== */
router.get("/profile-pic/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ profilePic: user.profilePic });
  } catch {
    res.status(500).json({ profilePic: null });
  }
});

module.exports = router;
