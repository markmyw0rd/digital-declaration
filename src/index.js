import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import StudentForm from "./components/StudentForm";
import SupervisorForm from "./components/SupervisorForm";
import AssessorForm from "./components/AssessorForm";
import "./index.css";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const role = getParam("role");
const id = getParam("id");

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!role || !id) {
  root.render(<App />);               // Start page with student name + supervisor email
} else if (role === "student") {
  root.render(<StudentForm />);
} else if (role === "supervisor") {
  root.render(<SupervisorForm />);
} else if (role === "assessor") {
  root.render(<AssessorForm />);
} else {
  root.render(<App />);
}
