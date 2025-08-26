const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    company: { type: String, trim: true },
    favorite: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
// The below line ensures that the combination of userId and email is unique. I've commented it because email isn't always required so I'm not sure if this would work.
// contactSchema.index({ userId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Contact", contactSchema);
