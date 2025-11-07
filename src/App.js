import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Corrected import paths — from /components/
import StartStudent from "./components/StartStudent";
import StudentForm from "./components/StudentForm";
import SupervisorForm from "./components/SupervisorForm";
import AssessorForm from "./components/AssessorForm";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Starting page */}
        <Route path="/" element={<StartStudent />} />

        {/* Each role’s signing page */}
        <Route path="/student" element={<StudentForm />} />
        <Route path="/supervisor" element={<SupervisorForm />} />
        <Route path="/assessor" element={<AssessorForm />} />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-center">
              <div>
                <h1 className="text-2xl font-bold text-red-600">
                  Page not found
                </h1>
                <p className="text-gray-600 mt-2">
                  Please check your link or return to the start page.
                </p>
                <a
                  href="/"
                  className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Back to start
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
