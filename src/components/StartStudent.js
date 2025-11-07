import React, { useState } from "react";
import { db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const start = async (e) => {
    e.preventDefault();
    setErr("");

    const name = studentName.trim();
    const sup = supervisorEmail.trim();

    if (!name) return setErr("Please enter the student name.");
    if (!sup || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sup))
      return setErr("Please enter a valid supervisor email.");

    try {
      setBusy(true);

      // 1) Create the ENVELOPE first (this is the id we’ll pass in the URL)
      const envRef = await addDoc(collection(db, "envelopes"), {
        status: "awaiting_student",
        studentName: name,
        supervisorEmail: sup,
        checklist: {
          studentSigned: false,
          supervisorSigned: false,
          assessorSigned: false,
        },
        unitCode: "AURTTE104",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const envelopeId = envRef.id;

      // 2) (Optional) Create a top-level declaration that references the envelope
      await addDoc(collection(db, "declarations"), {
        envelopeId,
        studentName: name,
        supervisorEmail: sup,
        unitCode: "AURTTE104",
        createdAt: serverTimestamp(),
      });

      // 3) Redirect student to the envelope
      const next = `/?id=${encodeURIComponent(envelopeId)}&role=student`;
      window.location.assign(next);
    } catch (e) {
      console.error(e);
      setErr("Could not start the declaration. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Start Declaration – AURTTE104
      </h1>

      <form onSubmit={start} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Student name</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g., Mark Alvin Mabayo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Supervisor email</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={supervisorEmail}
            onChange={(e) => setSupervisorEmail(e.target.value)}
            placeholder="e.g., supervisor@company.com"
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          className="w-full rounded bg-emerald-600 text-white py-2 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Starting…" : "Start"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        This is the only link you place in aXcelerate. Each student gets a unique
        workflow.
      </p>
    </div>
  );
}
