const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");

/* =================================================
   GET: Alerts for a specific user
   ================================================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await Subscription.find({
      $or: [
        { userId },
        { userId: new mongoose.Types.ObjectId(userId) }
      ]
    });

    const today = new Date();

    const alerts = subscriptions
      .map((sub) => {
        const renewalDate = new Date(sub.renewalDate);
        const diffDays = Math.ceil(
          (renewalDate - today) / (1000 * 60 * 60 * 24)
        );

        let alertType = null;

        if (diffDays < 0) {
          alertType = "EXPIRED";
        } else if (diffDays <= sub.alertDays) {
          alertType = "EXPIRING";
        }

        if (!alertType) return null;

        return {
          _id: sub._id,
          name: sub.name,
          renewalDate: sub.renewalDate,
          daysLeft: diffDays,
          alertType,
          emailAlertEnabled: sub.emailAlertEnabled
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error("Alert Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =================================================
   PUT: Toggle Email Alert ON / OFF
   ================================================= */
router.put("/toggle/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    subscription.emailAlertEnabled =
      !subscription.emailAlertEnabled;

    await subscription.save();

    res.status(200).json({
      success: true,
      emailAlertEnabled: subscription.emailAlertEnabled
    });
  } catch (error) {
    console.error("Toggle Alert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
