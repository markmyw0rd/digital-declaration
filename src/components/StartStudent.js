// src/components/StartStudent.js
import React, { useState } from "react";
import { db } from "../lib/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const start = async () => {
    if (!studentName.trim() || !supervisorEmail.trim()) {
      alert("Please enter student name and supervisor email.");
      return;
    }

    setSaving(true);
    try {
      // create the envelope
      const ref = await addDoc(collection(db, "envelopes"), {
        unitCode: "AURTTE104",
        status: "awaiting_student",
        studentName,
        supervisorEmail,
        studentSig: null,
        supervisorSig: null,
        assessorSig: null,
        outcome: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // strong consistency, but verify anyway and surface problems
      const created = await getDoc(doc(db, "envelopes", ref.id));
      if (!created.exists()) {
        console.error("[StartStudent] Created id but not found:", ref.id);
        alert("We couldn’t verify the record just created. Please try again.");
        setSaving(false);
        return;
      }

      // redirect on the same origin you’re currently on
      const url = new URL(window.location.href);
      url.search = `?id=${encodeURIComponent(ref.id)}&role=student`;
      window.location.assign(url.toString());
    } catch (e) {
      console.error("[StartStudent] Firestore add failed:", e);
      alert("Couldn’t start the declaration (write failed). Check Firestore rules/quotas and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Start Declaration – AURTTE104</h1>

      <label className="block text-sm font-medium">Student name</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 mb-4"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="Jane Student"
      />

      <label className="block text-sm font-medium">Supervisor email</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 mb-6"
        type="email"
        value={supervisorEmail}
        onChange={(e) => setSupervisorEmail(e.target.value)}
        placeholder="supervisor@example.com"
      />

      <button
        onClick={start}
        disabled={saving}
        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {saving ? "Starting…" : "Start"}
      </button>
    </div>
  );
}
