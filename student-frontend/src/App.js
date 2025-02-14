import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResultSearch from "./components/ResultSearch";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Router>
        <div className="app-main-content">
          <div className="app-header">
            <h1>STUDENT RESULT PORTAL</h1>
          </div>
          <Routes>
            <Route path="/" element={<ResultSearch />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
