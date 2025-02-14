const router = require("express").Router();
const Subject = require("../models/subject.model"); // Adjust the path if necessary
const Result = require("../models/result.model");
const Student = require("../models/student.model");
const Course = require("../models/course.model");
const auth = require("../middleware/auth.middleware");
const Settings = require("../models/settings.model");

// Get all results (protected route)
router.get("/", auth, async (req, res) => {
  try {
    const results = await Result.find()
      .populate("courseId")
      .populate("branchId")
      .populate("marks.subject");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/student", async (req, res) => {
  try {
    const { rollNo, courseId, branchId, semester } = req.query;
    console.log(rollNo, "-", courseId, "-", branchId, "-", semester);
    if (!rollNo || !courseId || !branchId || !semester) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    /////////////rough///////////

    const result = await Result.findOne({
      rollNo,
      courseId,
      branchId,
      semester,
    })
      .populate("courseId")
      .populate("branchId")
      .populate("marks.subject");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new result (protected route)
router.post("/", auth, async (req, res) => {
  try {
    let { rollNo, courseId, branchId, semester, marks } = req.body;
    console.log(rollNo, courseId, branchId, semester, marks);
    // Validate input
    if (!rollNo || !courseId || !branchId || !semester || !marks) {
      return res
        .status(400)
        .json({ message: "Please enter all required fields" });
    }

    rollNo = await Student.findById(rollNo);
    rollNo = rollNo.rollNo;
    console.log(rollNo, "hello");
    // Validate semester based on course duration
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const maxSemesters = parseInt(course.duration) * 2;
    if (semester < 1 || semester > maxSemesters) {
      return res
        .status(400)
        .json({ message: "Invalid semester for the selected course duration" });
    }

    // Validate roll number and fetch student name
    const student = await Student.findOne({
      rollNo,
      courseId,
      branchId,
      semester,
    });
    console.log(student.rollNo);
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found with the provided details" });
    }

    // Check if the result already exists for the given rollNo, courseId, branchId, and semester
    const existingResult = await Result.findOne({
      rollNo,
      courseId,
      branchId,
      semester,
    });
    if (existingResult) {
      return res
        .status(400)
        .json({ message: "Result for this student already exists" });
    }

    // Calculate total marks, percentage, and status
    let totalMarks = 0;
    let totalMaxMarks = 0;
    let failedSubjects = 0;

    for (const mark of marks) {
      const subject = await Subject.findById(mark.subject);
      if (!subject) {
        return res
          .status(400)
          .json({ message: `Subject with ID ${mark.subject} not found` });
      }

      totalMarks += mark.obtainedMarks;
      totalMaxMarks += subject.maxMarks;

      if (mark.obtainedMarks < subject.passingMarks) {
        failedSubjects++;
      }
    }

    const percentage = (totalMarks / totalMaxMarks) * 100;
    const status = failedSubjects > 0 ? "Fail" : "Pass";

    // Create new result
    const newResult = new Result({
      rollNo,
      name: student.name,
      courseId,
      branchId,
      semester,
      marks,
      totalMarks,
      percentage,
      status,
    });

    // Save result
    const savedResult = await newResult.save();

    // Populate after saving
    const populatedResult = await Result.findById(savedResult._id)
      .populate("courseId")
      .populate("branchId")
      .populate("marks.subject");

    res.json(populatedResult);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Update result (protected route)
router.put("/:id", auth, async (req, res) => {
  try {
    const resultId = req.params.id;
    let { rollNo, courseId, branchId, semester, marks } = req.body;
    // Validate input
    if (!rollNo || !courseId || !branchId || !semester || !marks) {
      return res
        .status(400)
        .json({ message: "Please enter all required fields" });
    }
    // Fetch student by rollNo to validate if they exist and fetch name
    rollNo = await Student.findById(rollNo);
    rollNo = rollNo.rollNo;
    console.log(rollNo, "hello");
    let student = await Student.findOne({ rollNo: rollNo }); // Changed from findById to findOne
    if (!student) {
      return res.status(404).json({ message: "Student not found bhai" });
    }

    // Validate semester based on course duration
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const maxSemesters = parseInt(course.duration) * 2;
    if (semester < 1 || semester > maxSemesters) {
      return res
        .status(400)
        .json({ message: "Invalid semester for the selected course duration" });
    }

    // Validate the student with the provided course, branch, and semester
    const studentData = await Student.findOne({
      rollNo,
      courseId,
      branchId,
      semester,
    });
    if (!studentData) {
      return res
        .status(404)
        .json({ message: "Student not found with the provided details" });
    }

    // Calculate total marks, percentage, and status
    let totalMarks = 0;
    let totalMaxMarks = 0;
    let failedSubjects = 0;

    for (const mark of marks) {
      const subject = await Subject.findById(mark.subject);
      if (!subject) {
        return res
          .status(400)
          .json({ message: `Subject with ID ${mark.subject} not found` });
      }

      totalMarks += mark.obtainedMarks;
      totalMaxMarks += subject.maxMarks;

      if (mark.obtainedMarks < subject.passingMarks) {
        failedSubjects++;
      }
    }

    const percentage = (totalMarks / totalMaxMarks) * 100;
    const status = failedSubjects > 0 ? "Fail" : "Pass";

    // Update the result
    const updatedResult = await Result.findByIdAndUpdate(
      resultId,
      {
        rollNo: studentData.rollNo,
        name: studentData.name,
        courseId,
        branchId,
        semester,
        marks,
        totalMarks,
        percentage,
        status,
      },
      { new: true }
    )
      .populate("courseId")
      .populate("branchId")
      .populate("marks.subject");

    if (!updatedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(updatedResult);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete result (protected route)
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedResult = await Result.findByIdAndDelete(req.params.id);

    if (!deletedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
///////////////////////////////rough////////////////////////////////////////

router.put("/admin/setGlobalReleaseDate", async (req, res) => {
  try {
    const { releaseDateTime } = req.body; // Expects releaseDateTime in the format YYYY-MM-DDTHH:mm:ss (ISO 8601 format)

    if (!releaseDateTime) {
      return res
        .status(400)
        .json({ message: "Please provide a release date and time" });
    }

    // Validate that the releaseDateTime is a valid date
    const releaseDate = new Date(releaseDateTime);
    if (isNaN(releaseDate.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    // Update the global release date and time in the settings collection
    console.log(Settings);
    const settings = await Settings.findOneAndReplace(
      {},
      { globalReleaseDate: releaseDate },
      { new: true, upsert: true } // upsert will create the document if not found
    );

    res.json({
      message: "Global release date and time set successfully",
      settings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/studentsss", async (req, res) => {
  try {
    const { rollNo, courseId, branchId, semester } = req.body; //req.query
    console.log(rollNo, "-", courseId, "-", branchId, "-", semester);

    if (!rollNo || !courseId || !branchId || !semester) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Fetch the global release date and time
    const settings = await Settings.findOne();
    if (!settings || !settings.globalReleaseDate) {
      return res.status(404).json({ message: "Global release date not set" });
    }

    const currentDate = new Date();

    // Check if the global release date and time has passed
    if (new Date(settings.globalReleaseDate) > currentDate) {
      return res.status(403).json({ message: "Results not yet released" });
    }

    // Fetch the student result
    const result = await Result.findOne({
      rollNo,
      courseId,
      branchId,
      semester,
    })
      .populate("courseId")
      .populate("branchId")
      .populate("marks.subject");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////////////////////////////////////////

module.exports = router;
