// src/App.js
import React from "react";
import StartStudent from "./pages/StartStudent";
import StudentForm from "./pages/StudentForm";
import SupervisorForm from "./pages/SupervisorForm";
import AssessorForm from "./pages/AssessorForm";

export default function App() {
  const qs = new URLSearchParams(window.location.search);
  const role = qs.get("role");

  if (role === "student") return <StudentForm />;
  if (role === "supervisor") return <SupervisorForm />;
  if (role === "assessor") return <AssessorForm />;
  return <StartStudent />;
}
