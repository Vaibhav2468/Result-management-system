// Subject Router
const router = require("express").Router();
const Subject = require("../models/subject.model");
const auth = require("../middleware/auth.middleware");
const Result = require("../models/result.model");
// Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().populate("branchId");
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects by branch
router.get("/branch/:branchId", async (req, res) => {
  try {
    const subjects = await Subject.find({
      branchId: req.params.branchId,
    }).populate("branchId");
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects by branch (with optional semester filter)
router.get("/branch/:branchId/semester/:semester", async (req, res) => {
  console.log("from the backend it is called");
  try {
    const { branchId, semester } = req.params;

    // Validate inputs
    if (!branchId || !semester) {
      return res
        .status(400)
        .json({ message: "Branch ID and Semester are required" });
    }

    // Find subjects by branch and semester
    const subjects = await Subject.find({ branchId, semester }).populate(
      "branchId"
    );

    if (!subjects || subjects.length === 0) {
      return res
        .status(404)
        .json({
          message: "No subjects found for the specified branch and semester",
        });
    }

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new subject (protected route)
router.post("/", auth, async (req, res) => {
  try {
    const { name, branchId, semester, maxMarks, passingMarks } = req.body;

    // Validate input
    if (!name || !branchId || !semester || !maxMarks || !passingMarks) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Ensure semester is within range
    if (semester < 1 || semester > 8) {
      return res
        .status(400)
        .json({ message: "Semester must be between 1 and 8" });
    }

    // Create new subject
    const newSubject = new Subject({
      name,
      branchId,
      semester,
      maxMarks,
      passingMarks,
    });

    // Save subject
    const savedSubject = await newSubject.save();
    const populatedSubject = await savedSubject.populate("branchId");
    res.json(populatedSubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update subject (protected route)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, semester, maxMarks, passingMarks } = req.body;
    const subjectId = req.params.id;

    // Validate input
    if (!name || !semester || !maxMarks || !passingMarks) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Ensure semester is within range
    if (semester < 1 || semester > 8) {
      return res
        .status(400)
        .json({ message: "Semester must be between 1 and 8" });
    }

    // Update subject
    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      { name, semester, maxMarks, passingMarks },
      { new: true }
    ).populate("branchId");

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(updatedSubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    // Find the subject by its ID
    const deletedSubject = await Subject.findById(req.params.id);

    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // First, delete all results associated with this subject's name and branchId
    await Result.deleteMany({
      subjectName: deletedSubject.name, // Assuming the field is 'name' in the Subject collection
      branchId: deletedSubject.branchId, // Assuming the field is 'branchId' in the Subject collection
    });

    // Now delete the subject
    await deletedSubject.remove();

    res.json({
      message: "Subject and associated results deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
