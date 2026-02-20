const cron = require("node-cron");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const nodemailer = require("nodemailer");

console.log("✅ Alert Scheduler Loaded");

// ================= EMAIL TRANSPORT =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= CRON JOB =================
// EMPORARY DEBUG FIX (do this NOW)
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Alert Cron Job Running (DEBUG – every minute)");

  try {
    const today = new Date();

    const subscriptions = await Subscription.find({
      emailAlertEnabled: true
    });

    console.log(`📦 Checking ${subscriptions.length} subscriptions`);

    for (const sub of subscriptions) {
      const renewal = new Date(sub.renewalDate);

      const diffDays = Math.ceil(
        (renewal - today) / (1000 * 60 * 60 * 24)
      );

      // ✅ SAFE ALERT CONDITION
      if (diffDays <= sub.alertDays && diffDays >= 0) {
        const user = await User.findById(sub.userId);
        if (!user) continue;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "🔔 Subscription Renewal Alert",
          text: `
Hello ${user.name},

Your subscription "${sub.name}" is ${
            diffDays === 0 ? "expiring today" : `expiring in ${diffDays} day(s)`
          }.

Renewal Date: ${renewal.toDateString()}

– Subscription Tracking Sentinel
          `
        });

        console.log(`📧 Email sent to ${user.email} for ${sub.name}`);
      }
    }
  } catch (err) {
    console.error("❌ Alert Scheduler Error:", err.message);
  }
});
