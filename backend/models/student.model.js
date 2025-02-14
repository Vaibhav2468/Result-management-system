const mongoose = require("mongoose");
const validator = require("validator");
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      validate: {
        validator: async function (value) {
          const course = await mongoose.model("Course").findById(this.courseId);
          if (!course) return false;

          const maxSemesters = parseInt(course.duration) * 2;
          return value >= 1 && value <= maxSemesters;
        },
        message:
          "Selected semester is not valid for the chosen course duration.",
      },
    },
    year: {
      type: String,
      enum: ["First Year", "Second Year", "Third Year", "Fourth Year"],
      required: true,
    },
    rollNo: {
      type: String,
      required: [true, "rollNo Is Required!"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save Middleware for Year Assignment
studentSchema.pre("save", async function (next) {
  if (this.semester === 1 || this.semester === 2) {
    this.year = "First Year";
  } else if (this.semester === 3 || this.semester === 4) {
    this.year = "Second Year";
  } else if (this.semester === 5 || this.semester === 6) {
    this.year = "Third Year";
  } else if (this.semester === 7 || this.semester === 8) {
    this.year = "Fourth Year";
  }

  next();
});

module.exports = mongoose.model("Student", studentSchema);
