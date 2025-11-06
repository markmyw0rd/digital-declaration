import React, { useState } from "react";
import { db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleStart(e) {
    e.preventDefault();
    if (!studentName.trim() || !supervisorEmail.trim()) {
      alert("Please fill in both fields.");
      return;
    }
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "envelopes"), {
        unitCode: "AURTTE104",
        status: "awaiting_student",
        studentName,
        supervisorEmail,
        assessorEmail: "",
        studentSignature: null,
        supervisorSignature: null,
        assessorSignature: null,
        outcome: null,
        checklist: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Show/confirm the created ID so you know it exists
      console.log("Envelope created:", ref.id);
      alert(`Created record:\n${ref.id}`);

      // Redirect on THE SAME origin you created it on
      window.location.href = `/?id=${encodeURIComponent(ref.id)}&role=student`;
    } catch (err) {
      console.error("Create envelope failed:", err);
      alert("Could not start the declaration. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">
        Start Declaration — AURTTE104
      </h1>
      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Student name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Jane Appleseed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Supervisor email</label>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            value={supervisorEmail}
            onChange={(e) => setSupervisorEmail(e.target.value)}
            placeholder="supervisor@example.com"
          />
        </div>

        <button
          disabled={saving}
          className="w-full rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Starting…" : "Start"}
        </button>

        <p className="text-xs text-gray-500">
          This is the only link you place in aXcelerate. Each student gets a unique workflow.
        </p>
      </form>
    </div>
  );
}
