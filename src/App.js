import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";

export default function App() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartDeclaration = async () => {
    if (!studentName || !supervisorEmail) {
      alert("Please enter both your name and your supervisor’s email.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a new Firestore record
      const docRef = await addDoc(collection(db, "declarations"), {
        studentName,
        supervisorEmail,
        status: "awaiting_student",
        createdAt: serverTimestamp(),
      });

      // Auto-redirect student to their page
      const studentLink = `${window.location.origin}/?id=${docRef.id}&role=student`;
      window.location.href = studentLink;
    } catch (err) {
      console.error("Error starting declaration:", err);
      alert("Failed to start declaration. Please contact IT.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Start Declaration – AURTTE104
        </h1>

        <label className="block mb-2 font-medium">Student name</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
        />

        <label className="block mb-2 font-medium">Supervisor email</label>
        <input
          type="email"
          value={supervisorEmail}
          onChange={(e) => setSupervisorEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
        />

        <button
          onClick={handleStartDeclaration}
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg w-full transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Starting..." : "Start"}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          This is the only link you place in aXcelerate. Each student gets a unique workflow.
        </p>
      </div>
    </div>
  );
}
