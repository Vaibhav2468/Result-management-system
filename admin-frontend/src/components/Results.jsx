import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./CommonStyles.css";
import Swal from "sweetalert2"; // SweetAlert2 for confirmation dialog
import { useCallback } from "react";
import API_BASE_URL from "../config";
const Results = () => {
  // State variables to manage results, courses, branches, subjects, semesters, and roll numbers
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [rollNos, setRollNos] = useState([]);

  // State to manage form data for adding/editing results
  const [formData, setFormData] = useState({
    rollNo: "", // Roll number of the student
    courseId: "",
    branchId: "",
    semester: "",
    marks: [],
  });

  // State to manage loading state during form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to manage modal visibility and editing state
  const [open, setOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  // Retrieve the authentication token from local storage
  const token = localStorage.getItem("auth-token");

  // Fetch all results from the API
  const fetchResults = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
    } catch (err) {
      toast.error("Failed to fetch results");
      console.error("Error fetching results:", err);
    }
  }, [token]);

  // Fetch all courses from the API
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      setCourses(response.data);
    } catch (err) {
      toast.error("Failed to fetch courses");
      console.error("Error fetching courses:", err);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    fetchCourses();
  }, [fetchResults, fetchCourses]);

  // Fetch branches based on the selected course
  const fetchBranches = async (courseId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/branches/course/${courseId}`
      );
      setBranches(response.data);
    } catch (err) {
      toast.error("Failed to fetch branches");
      console.error("Error fetching branches:", err);
    }
  };

  // Fetch subjects based on the selected branch and semester
  const fetchSubjects = async (branchId, semester) => {
    if (!branchId || !semester) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/subjects/branch/${branchId}/semester/${semester}`
      );
      setSubjects(response.data);
      // setFormData((prev) => ({
      //   ...prev,
      //   marks: response.data.map((subject) => ({
      //     subject: subject._id,
      //     obtainedMarks: 0,
      //   })),
      // }));
      setFormData((prev) => {
        const existingMarks = prev.marks || [];
        const newMarks = response.data.map((subject) => {
          const existing = existingMarks.find(
            (mark) => mark.subject === subject._id
          );
          return {
            subject: subject._id,
            obtainedMarks: existing?.obtainedMarks ?? "",
          };
        });

        return {
          ...prev,
          marks: newMarks,
        };
      });

      ///
    } catch (err) {
      toast.error("Failed to fetch subjects");
      console.error("Error fetching subjects:", err);
    }
  };

  // Fetch roll numbers based on the selected semester
  const fetchRollNos = async (semester) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/students/rollNo/${semester}`
      );
      setRollNos(response.data); // Update the rollNos state with the fetched data
    } catch (err) {
      toast.error("Failed to fetch roll numbers"); // Show an error toast if the request fails
      console.error("Error fetching roll numbers:", err);
    }
  };

  // Handle course selection change
  const handleCourseChange = (courseId) => {
    setFormData({
      ...formData,
      courseId,
      branchId: "",
      semester: "",
      marks: [],
      rollNo: "",
    });
    setBranches([]); // Clear branches list
    fetchBranches(courseId); // Fetch branches for the selected course
    setSemesters([]); // Clear semesters list
    if (courseId) {
      const selectedCourse = courses.find((course) => course._id === courseId);
      const durationInYears = parseInt(selectedCourse.duration, 10);
      const semesterOptions = Array.from(
        { length: durationInYears * 2 },
        (_, i) => i + 1
      );
      setSemesters(semesterOptions);
    }
  };

  // Handle branch selection change
  const handleBranchChange = (branchId) => {
    setFormData({
      ...formData,
      branchId,
      marks: [],
      semester: "",
      rollNo: "",
    });
    setSubjects([]); // Clear subjects list
  };

  const handleSemesterChange = (semester) => {
    setFormData({
      ...formData,
      semester,
      rollNo: "", // Reset rollNo when semester changes
    });

    if (formData.branchId) {
      fetchSubjects(formData.branchId, semester); // Fetch subjects for the selected branch and semester
    }
    fetchRollNos(semester); // Fetch roll numbers for the selected semester
  };

  // Handle roll number selection change
  const handleRollNoChange = async (rollNo) => {
    setFormData({
      ...formData,
      rollNo,
    });
  };

  // Open the modal for adding/editing a result
  const handleOpen = (result = null) => {
    if (result) {
      // If editing, populate the form with the selected result's data
      setEditingResult(result);
      setFormData({
        rollNo: result.rollNo,
        courseId: result.courseId._id,
        branchId: result.branchId._id,
        semester: result.semester,
        marks: result.marks,
      });

      fetchBranches(result.courseId._id); // Fetch branches for the selected course
      fetchSubjects(result.branchId._id, result.semester); // Fetch subjects for the selected branch and semester
      setSemesters([]); // Clear semesters list
      const durationInYears = parseInt(result.courseId.duration, 10);
      const semesterOptions = Array.from(
        { length: durationInYears * 2 },
        (_, i) => i + 1
      );
      setSemesters(semesterOptions); // Set semesters based on course duration
    } else {
      // If adding, reset the form
      setEditingResult(null);
      setFormData({
        rollNo: "",
        courseId: "",
        branchId: "",
        semester: "",
        marks: [],
      });
      setBranches([]);
      setSubjects([]);
      setSemesters([]);
    }
    setOpen(true); // Open the modal
  };

  // Close the modal and reset form data
  const handleClose = () => {
    setOpen(false); // Close the modal
    setEditingResult(null); // Reset editing state
    setFormData({
      rollNo: "",
      courseId: "",
      branchId: "",
      semester: "",
      marks: [],
    });
    setBranches([]);
    setSubjects([]);
    setSemesters([]);
  };

  // Handle form submission for adding/editing a result
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (
      !formData.rollNo ||
      !formData.courseId ||
      !formData.branchId ||
      !formData.semester
    ) {
      toast.error("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    // Validate that all subject marks are filled
    const missingMarks = formData.marks.some(
      (mark) => mark.obtainedMarks === null || mark.obtainedMarks === undefined
    );
    if (missingMarks) {
      toast.error("Please fill in all subject marks");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingResult) {
        // Update an existing result
        await axios.put(
          `${API_BASE_URL}/api/results/${editingResult._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Result updated successfully");
      } else {
        // Add a new result
        await axios.post(`${API_BASE_URL}/api/results`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Result added successfully");
      }

      // Refresh the results list and close the modal
      fetchResults();
      handleClose();
      setIsSubmitting(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  // Handle result deletion with a confirmation dialog
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this result. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",

      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Result deleted successfully!");
        fetchResults(); // Refresh the results list
      } catch (err) {
        toast.error("Failed to delete result");
        console.error("Error deleting result:", err);
      }
    }
  };

  return (
    <div className="results-container comman-container">
      <div className="header">
        <button className="add-button" onClick={() => handleOpen()}>
          Add Result
        </button>
      </div>

      {/* Results table */}
      <table className="results-table comman-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Course</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>Total Marks</th>
            <th>Percentage</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result._id}>
              <td>{result.rollNo}</td>
              <td>{result.courseId.name}</td>
              <td>{result.branchId.name}</td>
              <td>{result.semester}</td>
              <td>{result.totalMarks}</td>
              <td>{result.percentage.toFixed(2)}%</td>
              <td>{result.status}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleOpen(result)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(result._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding/editing results */}
      {open && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingResult ? "Edit Result" : "Add Result"}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Course:
                <select
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Branch:
                <select
                  value={formData.branchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  disabled={!formData.courseId}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Semester:
                <select
                  value={formData.semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  disabled={!formData.branchId}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Roll No:
                <select
                  value={formData.rollNo}
                  onChange={(e) => handleRollNoChange(e.target.value)}
                  disabled={!formData.semester}
                >
                  <option value="">Select Roll No</option>
                  {rollNos.map((roll) => (
                    <option key={roll._id} value={roll._id}>
                      {roll.rollNo}
                    </option>
                  ))}
                </select>
              </label>

              {/* Display subjects and marks input fields */}
              {subjects.length > 0 && (
                <div className="subjects-container">
                  <h3>Subjects</h3>
                  {subjects.map((subject) => (
                    <div key={subject._id} className="subject">
                      <label>
                        {subject.name}:
                        <input
                          type="number"
                          value={
                            formData.marks.find(
                              (mark) => mark.subject === subject._id
                            )?.obtainedMarks ?? ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              marks: prev.marks.map((mark) =>
                                mark.subject === subject._id
                                  ? {
                                      ...mark,
                                      obtainedMarks:
                                        value === "" ? "" : parseFloat(value),
                                    }
                                  : mark
                              ),
                            }));
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions dialog-actions">
                <button type="button" className="btn" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save"
                  disabled={isSubmitting}
                >
                  {editingResult
                    ? isSubmitting
                      ? "Updating..."
                      : "Update"
                    : isSubmitting
                    ? "Adding..."
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
