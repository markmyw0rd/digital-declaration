import React, { useState } from "react";
import { createEnvelope } from "../lib/envelopes";

const CANONICAL_ORIGIN = "https://digital-declaration.vercel.app";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!studentName.trim()) {
      alert("Please enter student name");
      return;
    }
    if (!supervisorEmail.trim()) {
      alert("Please enter supervisor email");
      return;
    }
    setBusy(true);
    try {
      const { id /*, supToken, assToken */ } = await createEnvelope({
        unitCode: "AURTTE104",
        studentName,
        supervisorEmail,
      });

      // Redirect to the canonical production domain to avoid preview-link issues
      const base = window.location.origin === CANONICAL_ORIGIN
        ? window.location.origin
        : CANONICAL_ORIGIN;

      const href = `${base}/?id=${encodeURIComponent(id)}&role=student`;
      console.log("[StartStudent] New envelope id =", id, "→", href);
      window.location.href = href;
    } catch (e) {
      console.error(e);
      alert("Could not start the declaration.");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">
        Start Declaration – AURTTE104
      </h1>
      <label className="block text-sm font-medium">Student name</label>
      <input
        className="mt-1 mb-3 w-full rounded border px-3 py-2"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="Student full name"
      />

      <label className="block text-sm font-medium">Supervisor email</label>
      <input
        className="mt-1 mb-4 w-full rounded border px-3 py-2"
        value={supervisorEmail}
        onChange={(e) => setSupervisorEmail(e.target.value)}
        type="email"
        placeholder="supervisor@example.com"
      />

      <button
        onClick={start}
        disabled={busy}
        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? "Creating…" : "Start"}
      </button>
    </div>
  );
}
