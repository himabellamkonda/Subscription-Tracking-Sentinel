const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const User = require("../models/User");

/* =========================================
   ADMIN DASHBOARD STATS
========================================= */
router.get("/stats", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    const today = new Date();

    const total = subscriptions.length;

    const expired = subscriptions.filter(
      (s) => new Date(s.renewalDate) < today
    ).length;

    const expiringSoon = subscriptions.filter((s) => {
      const diff =
        (new Date(s.renewalDate) - today) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= s.alertDays;
    }).length;

    const active = total - expired;

    res.json({
  success: true,
  stats: {
    total,
    active,
    expiringSoon,
    expired
  }
});

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================================
   GET SUBSCRIPTIONS BY TYPE (GROUPED)
========================================= */
router.get("/subscriptions/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const today = new Date();

    const subscriptions = await Subscription.find().populate("userId");

    let filtered = [];

    // 🔎 FILTER BY TYPE
    if (type === "expired") {
      filtered = subscriptions.filter(
        (s) => new Date(s.renewalDate) < today
      );
    }

    if (type === "expiring") {
      filtered = subscriptions.filter((s) => {
        const diff =
          (new Date(s.renewalDate) - today) /
          (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= s.alertDays;
      });
    }

    if (type === "active") {
      filtered = subscriptions.filter(
        (s) => new Date(s.renewalDate) >= today
      );
    }

    if (type === "all") {
      filtered = subscriptions;
    }

    // ✅ GROUP BY name + plan
    const grouped = {};

    filtered.forEach((sub) => {
      const key = `${sub.name}_${sub.plan}`;

      if (!grouped[key]) {
        grouped[key] = {
          name: sub.name,
          plan: sub.plan,
          count:0,
          users: []
          
        };
      }

      grouped[key].users.push({
        subscriptionId: sub._id,  
        name: sub.userId.name,
        email: sub.userId.email
      });
      grouped[key].count += 1;
    });

    res.json({
      success: true,
      subscriptions: Object.values(grouped)
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});



/* =========================================
   GET USER DETAILS FOR A SUBSCRIPTION
========================================= */
router.get("/subscription-user/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.json({ success: false });
    }

    const user = await User.findById(subscription.userId);

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================================
   DELETE SPECIFIC USER SUBSCRIPTION (ADMIN)
========================================= */
router.delete("/delete-subscription", async (req, res) => {
  try {
    const { name, plan, email } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 2️⃣ Delete only that specific subscription
    await Subscription.findOneAndDelete({
      name,
      plan,
      userId: user._id
    });

    res.json({
      success: true,
      message: "Subscription deleted successfully"
    });

  } catch (err) {
    console.error("Admin Delete Error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
