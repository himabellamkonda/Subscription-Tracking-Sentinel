const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    plan: {
      type: String,
      enum: ["Monthly", "Yearly"],
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    renewalDate: {
      type: Date,
      required: true
    },

    alertDays: {
      type: Number,
      enum: [7, 3],
      default: 7
    },

    // ✅ NEW: Email alert toggle (user controlled)
    emailAlertEnabled: {
      type: Boolean,
      default: true
    },
    autoRenewEnabled: {
  type: Boolean,
  default: false
}


  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
