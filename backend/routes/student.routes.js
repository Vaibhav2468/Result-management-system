const router = require("express").Router();
const Student = require("../models/student.model"); // Adjust the path if necessary
const Course = require("../models/course.model");
const Branch = require("../models/branch.model");
const auth = require("../middleware/auth.middleware");
const Result = require("../models/result.model");
// Get all students (protected route)
router.get("/", async (req, res) => {
  //auth
  try {
    const students = await Student.find()
      .populate("courseId")
      .populate("branchId");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by roll number (public route)
router.get("/by-rollNo", async (req, res) => {
  try {
    const { rollNo } = req.query;
    console.log(rollNo);
    if (!rollNo) {
      return res.status(400).json({ message: "Please provide a roll number" });
    }

    const student = await Student.findOne({ rollNo })
      .populate("courseId")
      .populate("branchId");

    if (!student) {
      return res.status(404).json({ message: "Student not found bro" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/student/:branchId", async (req, res) => {
  console.log("hello");
  try {
    const semester = await Student.find({
      branchId: req.params.branchId,
    }).populate("branchId");
    res.json(semester);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/rollNo/:semester", async (req, res) => {
  console.log("hello");
  try {
    const rollNo = await Student.find({
      semester: req.params.semester,
    }).populate("semester");
    res.json(rollNo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/studentName/:rollNo", async (req, res) => {
  console.log("hello");
  try {
    const studentName = await Student.find({ _id: req.params.rollNo }).populate(
      "rollNo"
    );
    res.json(studentName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new student (protected route)
router.post("/", auth, async (req, res) => {
  // auth
  try {
    const { name, rollNo, courseId, branchId, semester } = req.body;

    // Check if all required fields are provided
    if (!name || !rollNo || !courseId || !branchId || !semester) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if the roll number already exists
    let student = await Student.findOne({ rollNo });
    if (student) {
      return res
        .status(400)
        .json({ message: "This roll number is already enrolled" });
    }

    // Validate the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Validate the branch
    const branch = await Branch.findOne({ _id: branchId, courseId });
    if (!branch) {
      return res
        .status(404)
        .json({ message: "Branch not found for the selected course" });
    }

    // Validate the semester
    const maxSemesters = parseInt(course.duration) * 2;
    if (semester < 1 || semester > maxSemesters) {
      return res
        .status(400)
        .json({ message: "Invalid semester for the selected course duration" });
    }

    // Determine the year based on the semester
    let year;
    if (semester <= 2) year = "First Year";
    else if (semester <= 4) year = "Second Year";
    else if (semester <= 6) year = "Third Year";
    else year = "Fourth Year";

    // Create and save the student
    student = await Student.create({
      name,
      rollNo,
      courseId,
      branchId,
      semester,
      year,
    });

    // Send response with status 201 (Created)
    res.status(201).json({ message: "Student enrolled successfully", student });
  } catch (error) {
    // Handle any errors with the correct variable reference
    res.status(500).json({ error: error.message });
  }
});

// Update student details (protected route)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, rollNo, courseId, branchId, semester } = req.body;
    const studentId = req.params.id;

    // Validate input
    if (!name || !rollNo || !courseId || !branchId || !semester) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Validate course and branch
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const branch = await Branch.findOne({ _id: branchId, courseId });
    if (!branch) {
      return res
        .status(404)
        .json({ message: "Branch not found for the selected course" });
    }

    // Validate semester
    const maxSemesters = parseInt(course.duration) * 2;
    if (semester < 1 || semester > maxSemesters) {
      return res
        .status(400)
        .json({ message: "Invalid semester for the selected course duration" });
    }

    // Determine year based on semester
    let year;
    if (semester <= 2) year = "First Year";
    else if (semester <= 4) year = "Second Year";
    else if (semester <= 6) year = "Third Year";
    else year = "Fourth Year";

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { name, rollNo, courseId, branchId, semester, year },
      { new: true }
    )
      .populate("courseId")
      .populate("branchId");

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const studentId = req.params.id;

  try {
    // Retrieve student data to match the results
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete the results based on student rollNumber, course, semester, and branch
    result = await Result.deleteOne({
      rollno: student.rollNo,
      courseId: student.courseId, // Ensure this field matches in Result
      semester: student.semester, // Ensure this field matches in Result
      branchId: student.branchId, // Ensure this field matches in Result
    });
    const deletedStudent = await Student.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({
      message: "Student and associated results deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
