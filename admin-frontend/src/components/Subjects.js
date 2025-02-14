import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CommonStyles.css";
import Swal from "sweetalert2"; // for confirmation dialog
import API_BASE_URL from "../config";
const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    branchId: "",
    semester: 1,
    maxMarks: 100,
    passingMarks: 35,
  });

  const token = localStorage.getItem("auth-token");

  useEffect(() => {
    fetchSubjects();
    fetchBranches();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subjects`);
      setSubjects(response.data);
    } catch (err) {
      toast.error(" Failed to fetch subjects");
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branches`);
      setBranches(response.data);
    } catch (err) {
      toast.error(" Failed to fetch branches");
    }
  };

  const handleOpen = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        branchId: subject.branchId._id,
        semester: subject.semester,
        maxMarks: subject.maxMarks,
        passingMarks: subject.passingMarks,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        branchId: "",
        semester: 1,
        maxMarks: 100,
        passingMarks: 35,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSubject(null);
    setFormData({
      name: "",
      branchId: "",
      semester: 1,
      maxMarks: 100,
      passingMarks: 35,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await axios.put(
         `${API_BASE_URL}/api/subjects/${editingSubject._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(" Subject updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/subjects`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(" Subject added successfully!");
      }
      fetchSubjects();
      handleClose();
    } catch (err) {
      toast.error(`${err.response?.data?.message || "An error occurred"}`);
    }
  };

  const handleDelete = async (id) => {
    // SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this subject. This action cannot be undone!",
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
        await axios.delete(`${API_BASE_URL}/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Subject deleted successfully!");
        fetchSubjects(); // Refresh the subjects list
      } catch (err) {
        toast.error("Failed to delete subject");
        console.error("Error deleting subject:", err);
      }
    }
  };

  return (
    <div className="subjects-container comman-container">
      <div className="header">
        <button className="add-button" onClick={() => handleOpen()}>
          Add Subject
        </button>
      </div>

      <table className="subjects-table comman-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>Max Marks</th>
            <th>Passing Marks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject._id}>
              <td>{subject.name}</td>
              <td>{subject.branchId.name}</td>
              <td>{subject.semester}</td>
              <td>{subject.maxMarks}</td>
              <td>{subject.passingMarks}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleOpen(subject)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(subject._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>{editingSubject ? "Edit Subject" : "Add Subject"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) =>
                    setFormData({ ...formData, branchId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.courseId.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject Name</label>
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
                <label>Maximum Marks</label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxMarks: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Passing Marks</label>
                <input
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingMarks: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="dialog-actions">
                <button type="button" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit">
                  {editingSubject ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
