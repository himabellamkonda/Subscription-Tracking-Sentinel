const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");

/* =================================================
   POST: Add new subscription
   ================================================= */
router.post("/add", async (req, res) => {
  try {
    const {
      userId,
      name,
      category,
      plan,
      amount,
      startDate,
      renewalDate,
      alertDays
    } = req.body;

    if (
      !userId ||
      !name ||
      !category ||
      !plan ||
      !amount ||
      !startDate ||
      !renewalDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const subscription = new Subscription({
      userId,
      name,
      category,
      plan,
      amount,
      startDate,
      renewalDate,
      alertDays
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: "Subscription added successfully",
      subscription
    });
  } catch (error) {
    console.error("Add Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   GET: Get all subscriptions for a user
   ================================================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await Subscription.find({
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) }
      ]
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error("Fetch Subscriptions Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   GET: Get single subscription details
   ================================================= */
router.get("/detail/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error("Subscription Detail Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   PUT: Update (Edit) subscription
   ================================================= */
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        plan: req.body.plan,
        amount: req.body.amount,
        startDate: req.body.startDate,
        renewalDate: req.body.renewalDate,
        alertDays: req.body.alertDays
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription: updated
    });
  } catch (error) {
    console.error("Update Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   PUT: Toggle Email Alert (ON / OFF)
   ================================================= */
router.put("/toggle-email/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    subscription.emailAlertEnabled = !subscription.emailAlertEnabled;
    await subscription.save();

    res.status(200).json({
      success: true,
      emailAlertEnabled: subscription.emailAlertEnabled
    });
  } catch (error) {
    console.error("Toggle Email Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   DELETE: Delete subscription
   ================================================= */
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully"
    });
  } catch (error) {
    console.error("Delete Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


/* =================================================
   PUT: Renew subscription (Monthly / Yearly)
   ================================================= */
router.put("/renew/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const now = new Date();
    let newRenewalDate = new Date(now);

    // 🔁 Plan-based renewal logic
    if (subscription.plan === "Monthly") {
      newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
    } else if (subscription.plan === "Yearly") {
      newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
    }

    // ✅ Update dates
    subscription.startDate = now;
    subscription.renewalDate = newRenewalDate;

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription renewed successfully",
      subscription
    });
  } catch (error) {
    console.error("Renew Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   PUT: Toggle Auto-Renew (UI only for now)
   ================================================= */
router.put("/toggle-auto-renew/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    subscription.autoRenewEnabled = !subscription.autoRenewEnabled;
    await subscription.save();

    res.status(200).json({
      success: true,
      autoRenewEnabled: subscription.autoRenewEnabled
    });
  } catch (error) {
    console.error("Toggle Auto-Renew Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


/* =================================================
   PUT: Toggle Auto-Renew
   ================================================= */
router.put("/auto-renew/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    subscription.autoRenewEnabled = !subscription.autoRenewEnabled;
    await subscription.save();

    res.status(200).json({
      success: true,
      autoRenewEnabled: subscription.autoRenewEnabled
    });
  } catch (error) {
    console.error("Auto-Renew Toggle Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   ADMIN: Get Subscription Statistics
   ================================================= */
router.get("/admin/stats", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    const total = subscriptions.length;

    const expired = subscriptions.filter(
      (s) => new Date(s.renewalDate) < new Date()
    ).length;

    const expiringSoon = subscriptions.filter((s) => {
      const diff =
        (new Date(s.renewalDate) - new Date()) /
        (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= s.alertDays;
    }).length;

    const active = total - expired;

    res.json({
      success: true,
      total,
      active,
      expiringSoon,
      expired
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false });
  }
});


/* =================================================
   ADMIN: Get All Unique Subscriptions (No duplicates)
   ================================================= */
router.get("/admin/subscriptions", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    // Remove duplicates by subscription name
    const uniqueMap = {};

    subscriptions.forEach((sub) => {
      if (!uniqueMap[sub.name]) {
        uniqueMap[sub.name] = sub;
      }
    });

    const uniqueSubscriptions = Object.values(uniqueMap);

    res.json({
      success: true,
      subscriptions: uniqueSubscriptions
    });
  } catch (error) {
    console.error("Admin Subscriptions Error:", error);
    res.status(500).json({ success: false });
  }
});


/* =================================================
   ADMIN: Get Users Who Subscribed To Specific Service
   ================================================= */
router.get("/admin/subscription-users/:name", async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      name: req.params.name
    }).populate("userId", "name email");

    const users = subscriptions.map((sub) => sub.userId);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Admin Subscription Users Error:", error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
