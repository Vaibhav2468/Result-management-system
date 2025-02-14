import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toastify
import "./CommonStyles.css";
import Swal from "sweetalert2"; // SweetAlert2 for confirmation dialog
import API_BASE_URL from "../config";
const Student = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    courseId: "",
    branchId: "",
    semester: "",
  });
  // const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");

  const token = localStorage.getItem("auth-token");

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(response.data);
    } catch (err) {
      toast.error("Failed to fetch students"); // Show error toast
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      setCourses(response.data);
    } catch (err) {
      toast.error("Failed to fetch courses"); // Show error toast
    }
  };

  const fetchBranches = async (courseId) => {
    try {
      const response = await axios.get(
       `${API_BASE_URL}/api/branches/course/${courseId}`
      );
      setBranches(response.data);
    } catch (err) {
      toast.error("Failed to fetch branches"); // Show error toast
    }
  };

  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        rollNo: student.rollNo,
        courseId: student.courseId._id,
        branchId: student.branchId._id,
        semester: student.semester,
      });
      fetchBranches(student.courseId._id);
      updateSemesters(student.courseId.duration);
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        rollNo: "",
        courseId: "",
        branchId: "",
        semester: "",
      });
      setBranches([]);
      setSemesters([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      rollNo: "",
      courseId: "",
      branchId: "",
      semester: "",
    });
    setBranches([]);
    setSemesters([]);
  };

  const updateSemesters = (duration) => {
    const semesterOptions = Array.from(
      { length: 2 * duration },
      (_, i) => i + 1
    );
    setSemesters(semesterOptions);
  };

  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find((course) => course._id === courseId);
    if (selectedCourse) {
      updateSemesters(selectedCourse.duration);
    }
    setFormData((prev) => ({
      ...prev,
      courseId,
      branchId: "",
      semester: "",
    }));
    fetchBranches(courseId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(
         `${API_BASE_URL}/api/students/${editingStudent._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Student updated successfully"); // Show success toast
      } else {
        await axios.post(`${API_BASE_URL}/api/students`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Student added successfully"); // Show success toast
      }
      fetchStudents();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred"); // Show error toast
    }
  };

  const handleDelete = async (id) => {
    // SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this student. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If the user confirms the deletion
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Student deleted successfully!"); // Show success toast
        fetchStudents(); // Refresh the student list
      } catch (err) {
        toast.error("Failed to delete student"); // Show error toast
        console.error("Error deleting student:", err);
      }
    }
  };

  return (
    <div className="student-container comman-container">
      {/* {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>} */}

      <div className="header">
        <button className="add-button" onClick={() => handleOpen()}>
          Add Student
        </button>
      </div>

      <table className="student-table comman-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Course</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.rollNo}</td>
              <td>{student.courseId.name}</td>
              <td>{student.branchId.name}</td>
              <td>{student.semester}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleOpen(student)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(student._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingStudent ? "Edit Student" : "Add Student"}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>

              <label>
                Roll No:
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNo: e.target.value })
                  }
                />
              </label>

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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      branchId: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      semester: e.target.value,
                    }))
                  }
                  disabled={!formData.courseId}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions dialog-actions">
                <button type="button" className="btn" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn save">
                  {editingStudent ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;
