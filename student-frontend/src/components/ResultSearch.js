import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPrint } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ResultSearch.css";
import API_BASE_URL from "../config";
const ResultSearch = () => {
   // State to store available courses, branches, and semesters
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
   // State to manage user input and result data
  const [formData, setFormData] = useState({
    courseId: "",
    branchId: "",
    semester: "",
    rollNo: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      setCourses(response.data);
    } catch (err) {
      toast.error("Failed to fetch courses");
    }
  };

  const fetchBranches = async (courseId) => {
    try {
      const response = await axios.get(
       `${API_BASE_URL}/api/branches/course/${courseId}`
      );
      setBranches(response.data);
    } catch (err) {
      toast.error("Failed to fetch branches");
    }
  };
  // Handle changes when a course is selected
  const handleCourseChange = (courseId) => {
    setFormData({
      ...formData,
      courseId,
      branchId: "",
      semester: "",
    });
    setResult(null);
    fetchBranches(courseId);

    // Determine semesters based on course duration (assuming 2 per year)
    const selectedCourse = courses.find((course) => course._id === courseId);
    if (selectedCourse) {
      const semestersCount = selectedCourse.duration * 2;
      const semesterOptions = [];
      for (let i = 1; i <= semestersCount; i++) {
        semesterOptions.push(i);
      }
      setSemesters(semesterOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/results/student`,
        {
          params: formData,
        }
      );
      setResult(response.data);
      toast.success("Results are now available!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch result");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("resultToPrint").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();

    // Restore the original content after printing
    document.body.innerHTML = originalContent;
  };

  return (
    <div className="container">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {error && <div className="alert error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
            {/* Course selection dropdown */}
        <div className="form-group">
          <label htmlFor="course">Course</label>
          <select
            id="course"
            value={formData.courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
  {/* Branch selection dropdown */}
        <div className="form-group">
          <label htmlFor="branch">Branch</label>
          <select
            id="branch"
            value={formData.branchId}
            onChange={(e) =>
              setFormData({ ...formData, branchId: e.target.value })
            }
            required
            disabled={!formData.courseId}
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
   {/* Semester selection dropdown */}
        <div className="form-group">
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            value={formData.semester}
            onChange={(e) =>
              setFormData({ ...formData, semester: e.target.value })
            }
            required
            disabled={!formData.branchId}
          >
            <option value="">Select Semester</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </div>
    {/* Roll Number input */}
        <div className="form-group">
          <label htmlFor="rollNo">Roll Number</label>
          <input
            id="rollNo"
            type="text"
            value={formData.rollNo}
            onChange={(e) =>
              setFormData({ ...formData, rollNo: e.target.value })
            }
            required
          />
        </div>

        <div className="perent-btn">
          <button
            type="submit"
            className="submit-btn"
            disabled={
              !formData.courseId ||
              !formData.branchId ||
              !formData.semester ||
              !formData.rollNo
            }
          >
            View Result
          </button>
        </div>
      </form>
     {/* Display result details if available */}
      {result && (
        <div className="result-container" id="resultToPrint">
          <div className="print-icon-container">
            <FaPrint
              onClick={handlePrint}
              className="print-icon"
              title="Print Result"
            />
          </div>
          <h2>Result Details</h2>
          <hr></hr>
          <h4 className="college-name">
            <strong>Global Institute of Technology</strong>, Bhopal
          </h4>
          <table className="student-info">
            <thead>
              <tr>
                <th colSpan="2">Student Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name</td>
                <td>{result.name}</td>
              </tr>
              <tr>
                <td>Roll Number</td>
                <td>{result.rollNo}</td>
              </tr>
              <tr>
                <td>Course</td>
                <td>{result.courseId.name}</td>
              </tr>
              <tr>
                <td>Branch</td>
                <td>{result.branchId.name}</td>
              </tr>
              <tr>
                <td>Semester</td>
                <td>{formData.semester}</td>
              </tr>
            </tbody>
          </table>

          <table className="marks-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks Obtained</th>
                <th>Maximum Marks</th>
                <th>Passing Marks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.marks.map((mark) => (
                <tr key={mark.subject._id}>
                  <td>{mark.subject.name}</td>
                  <td>{mark.obtainedMarks}</td>
                  <td>{mark.subject.maxMarks}</td>
                  <td>{mark.subject.passingMarks}</td>
                  <td>
                    {mark.obtainedMarks >= mark.subject.passingMarks
                      ? "Pass"
                      : "Fail"}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="5">
                  <table className="total-info-table">
                    <thead>
                      <tr>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                        <th>Final Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{result.totalMarks}</td>
                        <td>{result.percentage.toFixed(2)}%</td>
                        <td>
                          <span
                            className={`status ${result.status.toLowerCase()}`}
                          >
                            {result.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultSearch;
