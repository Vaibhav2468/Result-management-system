const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: true,
      default: 35,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique subject names within a branch and semester
subjectSchema.index({ name: 1, branchId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
