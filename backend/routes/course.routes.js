const router = require("express").Router();
const Course = require("../models/course.model");
const auth = require("../middleware/auth.middleware");
const Subject = require("../models/subject.model"); // Adjust the path if necessary
const Result = require("../models/result.model");
const Student = require("../models/student.model");
const Branch = require("../models/branch.model");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new course (protected route)
router.post("/", auth, async (req, res) => {
  try {
    const { name, duration, description } = req.body;

    // Validate input
    if (!name || !duration || !description) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).json({ message: "Course already exists" });
    }

    // Create new course
    const newCourse = new Course({
      name,
      duration,
      description,
    });

    // Save course
    const savedCourse = await newCourse.save();
    res.json(savedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update course (protected route)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, duration, description } = req.body;
    const courseId = req.params.id;

    // Validate input
    if (!name || !duration || !description) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { name, duration, description },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const courseId = req.params.id;

  try {
    // 1. Delete all results associated with the course (if they have a reference to course)
    await Result.deleteMany({ courseId });

    // 2. Delete all students associated with the course (if they have a reference to course)
    await Student.deleteMany({ courseId });

    // 3. Delete all subjects related to the course (assuming each subject is linked to branches)
    const branches = await Branch.find({ courseId }); // Find all branches for the course
    const branchIds = branches.map((branch) => branch._id); // Get all branch IDs

    // Delete all subjects related to these branches
    await Subject.deleteMany({ branchId: { $in: branchIds } });

    // 4. Delete all branches related to the course
    await Branch.deleteMany({ courseId });

    // 5. Delete the course itself
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course and all associated data deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
