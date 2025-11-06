// src/components/StartStudent.js
import React, { useState } from "react";
import { db } from "../lib/firebase";           // <-- keep your path
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const start = async () => {
    setErr("");
    if (!studentName.trim()) return setErr("Please enter the student name.");
    if (!supervisorEmail.trim()) return setErr("Please enter the supervisor email.");

    setBusy(true);
    try {
      // 1) Create the envelope
      const ref = await addDoc(collection(db, "envelopes"), {
        unitCode: "AURTTE104",
        status: "awaiting_student",
        studentName: studentName.trim(),
        supervisorEmail: supervisorEmail.trim(),
        studentSignature: null,
        supervisorSignature: null,
        assessorSignature: null,
        outcome: null,
        checklist: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("[StartStudent] Created envelope id =", ref.id);

      // 2) Redirect the student to their record
      const url = `${window.location.origin}/?id=${encodeURIComponent(ref.id)}&role=student`;
      window.location.replace(url);
    } catch (e) {
      console.error("[StartStudent] Failed to create envelope:", e);
      setErr("Could not start the declaration. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Start Declaration – AURTTE104</h1>

      <div className="space-y-4 bg-white shadow rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium">Student name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Mark Alvin Mabayo"
            disabled={busy}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Supervisor email</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={supervisorEmail}
            onChange={(e) => setSupervisorEmail(e.target.value)}
            placeholder="supervisor@example.com"
            disabled={busy}
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          onClick={start}
          disabled={busy}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Start"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Tip: Check DevTools → Console. You should see:
        <code> [StartStudent] Created envelope id = …</code>
      </p>
    </div>
  );
}
