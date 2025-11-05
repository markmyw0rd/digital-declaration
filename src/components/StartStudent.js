// src/components/StartStudent.js
import React, { useState } from "react";
import { db } from "../firebase";               // your existing Firestore export
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !supervisorEmail.trim()) {
      alert("Please fill in both fields.");
      return;
    }
    setBusy(true);
    try {
      const docRef = await addDoc(collection(db, "envelopes"), {
        unitCode: "AURTTE104",
        studentName,
        supervisorEmail,
        status: "awaiting_student",
        createdAt: serverTimestamp(),
      });

      // Immediately send the student to their signing page
      const id = docRef.id;
      const url = `${window.location.origin}/?id=${encodeURIComponent(
        id
      )}&role=student`;
      window.location.replace(url);
    } catch (err) {
      console.error(err);
      alert("Could not start the declaration.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Start Declaration – AURTTE104</h1>

      <form onSubmit={start} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Student name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g., Mark Alvin Mabayo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Supervisor email</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={supervisorEmail}
            onChange={(e) => setSupervisorEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Starting…" : "Start"}
        </button>

        <p className="text-xs text-gray-500">
          Tip: This page is the only link you place in aXcelerate. It creates a
          unique declaration for each student.
        </p>
      </form>
    </div>
  );
}
