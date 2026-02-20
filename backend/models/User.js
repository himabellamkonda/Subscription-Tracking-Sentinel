const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
profilePic: {
  type: String, // base64 or image URL
  default: null
}
  },
  {
    timestamps: true
  }
);

// Export User Model
module.exports = mongoose.model("User", userSchema);
