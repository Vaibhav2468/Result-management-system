import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CommonStyles.css";
import Swal from "sweetalert2"; //  for confirmation dialogs
import API_BASE_URL from "../config";
const Courses = () => {
  const [courses, setCourses] = useState([]); // State for storing courses list
  const [open, setOpen] = useState(false); // Dialog state for adding/editing a course
  const [editingCourse, setEditingCourse] = useState(null); // Track the course being edited
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    description: "",
  });

  const token = localStorage.getItem("auth-token"); // Retrieve authentication token for API requests

  useEffect(() => {
    fetchCourses(); // Fetch courses when the component mounts
  }, []);

  // Fetch the list of courses from the backend
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      setCourses(response.data);
    } catch (err) {
      toast.error("Failed to fetch courses");
    }
  };

  // Open the dialog for adding or editing a course
  const handleOpen = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        duration: course.duration,
        description: course.description,
      });
    } else {
      setEditingCourse(null);
      setFormData({ name: "", duration: "", description: "" }); // Reset form for new entry
    }
    setOpen(true);
  };

  // Close the dialog and reset form data
  const handleClose = () => {
    setOpen(false);
    setEditingCourse(null);
    setFormData({ name: "", duration: "", description: "" });
  };

  // Handle form submission for adding or updating a course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        // Update existing course
        await axios.put(
         `${API_BASE_URL}/api/courses/${editingCourse._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Course updated successfully");
      } else {
        // Create a new course
        await axios.post(`${API_BASE_URL}/api/courses`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Course added successfully");
      }
      fetchCourses(); // Refresh the list after adding/updating
      handleClose(); // Close the dialog
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  // Handle deleting a course with confirmation
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this course. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Course deleted successfully");
        fetchCourses(); // Refresh the list
      } catch (err) {
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <div className="courses-container comman-container">
      <div className="header">
        <button className="add-button" onClick={() => handleOpen()}>
          Add Course
        </button>
      </div>

      {/* Table displaying list of courses */}
      <table className="courses-table comman-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Duration</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id}>
              <td>{course.name}</td>
              <td>{course.duration}</td>
              <td>{course.description}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleOpen(course)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(course._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dialog Box for adding/editing courses */}
      {open && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>{editingCourse ? "Edit Course" : "Add Course"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  required
                />
              </div>
              <div className="dialog-actions">
                <button type="button" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit">
                  {editingCourse ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
