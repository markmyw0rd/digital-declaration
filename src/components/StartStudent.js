import React, { useState } from "react";
import { createEnvelope } from "../lib/envelopes";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const start = async () => {
    setErr("");

    if (!studentName.trim() || !supervisorEmail.trim()) {
      setErr("Please enter student name and supervisor email.");
      return;
    }

    setSaving(true);
    try {
      // 1) Create the envelope
      const { id } = await createEnvelope({
        unitCode: "AURTTE104",
        studentName: studentName.trim(),
        supervisorEmail: supervisorEmail.trim(),
      });

      // 2) Verify the document actually exists before redirecting
      const snap = await getDoc(doc(db, "envelopes", id));
      if (!snap.exists()) {
        console.warn("[StartStudent] Created id but could not read it back:", id);
        setErr("We couldn’t verify the new record. Please try again in a few seconds.");
        setSaving(false);
        return;
      }

      // 3) Safe redirect with id + role
      const u = new URL(window.location.href);
      u.searchParams.set("id", id);
      u.searchParams.set("role", "student");
      window.location.replace(`${u.origin}${u.pathname}?${u.searchParams.toString()}`);
    } catch (e) {
      console.error("[StartStudent] create failed:", e);
      setErr(
        e?.message ||
          "Could not start the declaration. Check your connection and try again."
      );
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-4">Start Declaration – AURTTE104</h1>

      <label className="block text-sm font-medium">Student name</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 mb-4"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="Jane Appleseed"
      />

      <label className="block text-sm font-medium">Supervisor email</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 mb-6"
        type="email"
        value={supervisorEmail}
        onChange={(e) => setSupervisorEmail(e.target.value)}
        placeholder="supervisor@example.com"
      />

      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

      <button
        onClick={start}
        disabled={saving}
        className="w-full px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {saving ? "Starting…" : "Start"}
      </button>
    </div>
  );
}
