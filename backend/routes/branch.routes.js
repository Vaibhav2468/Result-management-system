const router = require("express").Router();
const Branch = require("../models/branch.model");
const auth = require("../middleware/auth.middleware");
const Subject = require("../models/subject.model"); 
const Result = require("../models/result.model");
const Student = require("../models/student.model");
const mongoose = require("mongoose");
// Get all branches
router.get("/", async (req, res) => {
  try {
    const branches = await Branch.find().populate("courseId");
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get branches by course
router.get("/course/:courseId", async (req, res) => {
  try {
    const branches = await Branch.find({
      courseId: req.params.courseId,
    }).populate("courseId");
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new branch (protected route)
router.post("/", auth, async (req, res) => {
  try {
    const { name, courseId, description } = req.body;

    // Validate input
    if (!name || !courseId || !description) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Create new branch
    const newBranch = new Branch({
      name,
      courseId,
      description,
    });

    // Save branch
    const savedBranch = await newBranch.save();
    const populatedBranch = await savedBranch.populate("courseId");
    res.json(populatedBranch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update branch (protected route)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const branchId = req.params.id;

    // Validate input
    if (!name || !description) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Update branch
    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      { name, description },
      { new: true }
    ).populate("courseId");

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json(updatedBranch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const branchId = req.params.id;

  try {
    // 1. Delete all subjects associated with the branch
    await Subject.deleteMany({ branchId });

    // 2. Delete all students associated with the branch
    await Student.deleteMany({ branchId });

    // 3. Delete all results associated with the branch
    await Result.deleteMany({ branchId });

    // 4. Finally, delete the branch itself
    const deletedBranch = await Branch.findByIdAndDelete(branchId);

    if (!deletedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({
      message:
        "Branch and associated data (subjects, students, results) deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
