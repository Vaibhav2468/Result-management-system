const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
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
        // Fetch course details to determine the valid range of semesters
        const course = await mongoose.model("Course").findById(this.courseId);
        if (!course) return false;

        const maxSemesters = parseInt(course.duration) * 2; // Assuming 2 semesters per year
        return value >= 1 && value <= maxSemesters;
      },
      message: "Invalid semester for the selected course duration.",
    },
  },
  rollNo: {
    type: String,
    required: true,
    validate: {
      validator: async function (value) {
        // Ensure the roll number exists in the Student collection
        const student = await mongoose.model("Student").findOne({
          courseId: this.courseId,
          branchId: this.branchId,
          semester: this.semester,
          rollNo: value,
        });
        return !!student;
      },
      message:
        "Roll number does not exist for the selected course, branch, and semester.",
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  marks: [
    {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
      obtainedMarks: {
        type: Number,
        required: true,
      },
    },
  ],
  totalMarks: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pass", "Fail"],
    required: true,
  },
});

// Pre-save Middleware to Auto-fill Name
resultSchema.pre("save", async function (next) {
  // Fetch student details based on rollNo, courseId, branchId, and semester
  const student = await mongoose.model("Student").findOne({
    courseId: this.courseId,
    branchId: this.branchId,
    semester: this.semester,
    rollNo: this.rollNo,
  });

  if (student) {
    this.name = student.name; // Auto-fill the name
  } else {
    throw new Error("Invalid roll number. Cannot find student details.");
  }

  next();
});

module.exports = mongoose.model("Result", resultSchema);
