import React, { useEffect, useState } from "react";
import {
  AiOutlineHome,
  AiOutlineBook,
  AiOutlineCluster,
  AiOutlineRead,
  AiOutlineUser,
} from "react-icons/ai";
import axios from "axios";
import "./Home.css";
import API_BASE_URL from "../config";
const Home = () => {
  // State variables to store counts of different entities
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalBranches, setTotalBranches] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [error, setError] = useState(null); // State to handle API errors
  const [rotation, setRotation] = useState(0); // Rotation animation state

  useEffect(() => {
    // Fetch initial data when component mounts
    fetchCourses();
    fetchBranches();
    fetchSubjects();
    fetchStudents();

    // Set an interval for rotating an image in UI
    const interval = setInterval(() => {
      setRotation((prevRotation) => prevRotation + 1);
    }, 50);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Function to fetch courses count from backend
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      setTotalCourses(response.data.length);
    } catch (err) {
      setError("Failed to fetch courses. Please try again later.");
    }
  };

  // Function to fetch branches count
  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branches`);
      setTotalBranches(response.data.length);
    } catch (err) {
      setError("Failed to fetch branches. Please try again later.");
    }
  };

  // Function to fetch subjects count
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subjects`);
      setTotalSubjects(response.data.length);
    } catch (err) {
      setError("Failed to fetch subjects. Please try again later.");
    }
  };

  // Function to fetch students count
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students`);
      setTotalStudents(response.data.length);
    } catch (err) {
      setError("Failed to fetch students. Please try again later.");
    }
  };

  // Card data for UI display
  const cards = [
    {
      title: "Total Courses",
      count: totalCourses,
      color: "#1976d2",
      icon: <AiOutlineBook size={50} />,
    },
    {
      title: "Total Branches",
      count: totalBranches,
      color: "#2e7d32",
      icon: <AiOutlineCluster size={50} />,
    },
    {
      title: "Total Subjects",
      count: totalSubjects,
      color: " #f28c28",
      icon: <AiOutlineRead size={50} />,
    },
    {
      title: "Total Students",
      count: totalStudents,
      color: "#d32f2f",
      icon: <AiOutlineUser size={50} />,
    },
  ];

  return (
    <div className="home-container">
      {/* Page header */}
      <div className="home-header">
        <AiOutlineHome size={24} className="home-icon" /> Home
      </div>

      {/* Display error message if any API call fails */}
      {error && <div className="error-message">{error}</div>}

      {/* Dashboard cards showing statistics */}
      <div className="stats-cards">
        {cards.map((card, index) => (
          <div
            key={index}
            className="stats-card"
            style={{ backgroundColor: card.color }}
          >
            {card.icon}
            <h3>{card.title}</h3>
            <p>{card.count}</p>
          </div>
        ))}
      </div>

      {/* Animated images section */}
      <div className="design-container">
        <img
          src="https://res.cloudinary.com/doazyk6kl/image/upload/v1739468977/Result%20management%20system/result%206.png"
          alt="result 6"
        />
        <img
          src="https://res.cloudinary.com/doazyk6kl/image/upload/v1739468979/Result%20management%20system/result%208.png"
          alt="result 8"
          style={{ transform: `translate(10px, 20px) rotate(${rotation}deg)` }}
        />
        <img
          src="https://res.cloudinary.com/doazyk6kl/image/upload/v1739468982/Result%20management%20system/resut%207.png"
          alt="result 7"
        />
      </div>
    </div>
  );
};

export default Home;
