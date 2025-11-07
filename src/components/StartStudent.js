// src/pages/StartStudent.js
import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onStart = async (e) => {
    e.preventDefault();
    setErr("");
    if (!studentName.trim() || !supervisorEmail.trim()) {
      setErr("Please fill in both fields.");
      return;
    }
    try {
      setBusy(true);
      // ✅ write to declarations
      const ref = await addDoc(collection(db, "declarations"), {
        createdAt: serverTimestamp(),
        status: "awaiting_student",
        studentName: studentName.trim(),
        supervisorEmail: supervisorEmail.trim(),
        checklist: {},
      });
      console.log("[StartStudent] created id =", ref.id);
      // route student to their form
      window.location.assign(`/?id=${ref.id}&role=student`);
    } catch (e2) {
      console.error(e2);
      setErr("Could not start. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onStart} className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Start Declaration – AURTTE104</h1>
      <div>
        <label className="block text-sm mb-1">Student name</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Supervisor email</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={supervisorEmail}
          onChange={(e) => setSupervisorEmail(e.target.value)}
        />
      </div>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button
        disabled={busy}
        className="w-full bg-emerald-600 text-white rounded py-2 disabled:opacity-60"
      >
        {busy ? "Starting..." : "Start"}
      </button>
    </form>
  );
}
