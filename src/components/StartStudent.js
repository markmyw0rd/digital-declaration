import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function handleStart(e) {
    e.preventDefault();
    setErr("");
    if (!studentName.trim() || !supervisorEmail.trim()) {
      setErr("Please enter student name and supervisor email.");
      return;
    }
    try {
      setSubmitting(true);

      // 1) Create the doc and WAIT for the id
      const ref = await addDoc(collection(db, "envelopes"), {
        unitCode: "AURTTE104",
        status: "awaiting_student",
        studentName,
        supervisorEmail,
        studentSignature: null,
        supervisorSignature: null,
        assessorSignature: null,
        outcome: null,
        checklist: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("[StartStudent] Created envelope id =", ref.id);

      // 2) (Optional) write the id back into the doc for easy audit
      // await setDoc(ref, { _selfId: ref.id }, { merge: true });

      // 3) Redirect only AFTER creation is confirmed
      const dest = `${window.location.origin}?id=${encodeURIComponent(
        ref.id
      )}&role=student`;
      console.log("[StartStudent] Redirecting to", dest);
      window.location.assign(dest);
    } catch (e) {
      console.error("[StartStudent] Create failed:", e);
      setErr("Could not start declaration. Check console for details.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleStart} className="space-y-4">
      <div>
        <label>Student name</label>
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label>Supervisor email</label>
        <input
          value={supervisorEmail}
          onChange={(e) => setSupervisorEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      {err && <p className="text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-emerald-600 text-white px-6 py-3 rounded disabled:opacity-50"
      >
        {submitting ? "Starting..." : "Start"}
      </button>
    </form>
  );
}
