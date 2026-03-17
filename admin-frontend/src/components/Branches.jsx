import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CommonStyles.css";
import Swal from "sweetalert2"; // for confirmation dialogs
import API_BASE_URL from "../config";
console.log(API_BASE_URL);
const Branches = () => {
  const [branches, setBranches] = useState([]); // Store the list of branches
  const [courses, setCourses] = useState([]); // Store the list of available courses
  const [open, setOpen] = useState(false); // Dialog state for adding/editing a branch
  const [editingBranch, setEditingBranch] = useState(null); // Track which branch is being edited
  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    description: "",
  });

  const token = localStorage.getItem("auth-token"); // Retrieve authentication token for API requests

  useEffect(() => {
    fetchBranches();
    fetchCourses();
  }, []); // Fetch branches and courses when the component mounts

  // Fetch the list of branches from the backend
  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branches`);
      setBranches(response.data);
    } catch (err) {
      toast.error("Failed to fetch branches");
    }
  };

  // Fetch the list of courses to populate the dropdown
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      setCourses(response.data);
    } catch (err) {
      toast.error("Failed to fetch courses");
    }
  };

  // Open the dialog for adding or editing a branch
  const handleOpen = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        courseId: branch.courseId._id, // Extract course ID from the branch data
        description: branch.description,
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: "", courseId: "", description: "" }); // Reset form for new entry
    }
    setOpen(true);
  };

  // Close the dialog and reset form data
  const handleClose = () => {
    setOpen(false);
    setEditingBranch(null);
    setFormData({ name: "", courseId: "", description: "" });
  };

  // Handle form submission for adding or updating a branch
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        // Update existing branch
        await axios.put(
          `${API_BASE_URL}/api/branches/${editingBranch._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Branch updated successfully!");
      } else {
        // Create a new branch
        await axios.post(`${API_BASE_URL}/api/branches`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Branch added successfully!");
      }
      fetchBranches(); // Refresh the list after adding/updating
      handleClose(); // Close the dialog
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  // Handle deleting a branch with confirmation
  const handleDelete = async (id) => {
    // Show a confirmation dialog before deleting
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this branch. This action cannot be undone!",
      icon: "warning", // Warning icon
      showCancelButton: true, // Show cancel button
      confirmButtonColor: "#3085d6", // Confirm button color
      cancelButtonColor: "#d33", // Cancel button color
      confirmButtonText: "Yes, delete it!", // Confirm button text
      cancelButtonText: "Cancel", // Cancel button text

      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
    });

    // If user confirms deletion
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/branches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Branch deleted successfully!");
        fetchBranches(); // Refresh the list
      } catch (err) {
        toast.error("Failed to delete branch");
      }
    }
  };

  return (
    <div className="branches-container comman-container">
      <div className="header">
        <button className="add-button" onClick={() => handleOpen()}>
          Add Branch
        </button>
      </div>

      {/* Table displaying list of branches */}
      <table className="branches-table comman-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Course</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch._id}>
              <td>{branch.name}</td>
              <td>{branch.courseId.name}</td>
              <td>{branch.description}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleOpen(branch)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(branch._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dialog Box for adding/editing branches */}
      {open && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>{editingBranch ? "Edit Branch" : "Add Branch"}</h2>
            <form onSubmit={handleSubmit}>
              {/* Course Selection */}
              <div className="form-group">
                <label>Course</label>
                <select
                  className="Selector"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Name Input */}
              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Branch Description Input */}
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

              {/* Action Buttons */}
              <div className="dialog-actions">
                <button type="button" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit">
                  {editingBranch ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
