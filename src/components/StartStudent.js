import React, { useState } from "react";
import { db } from "../lib/firebase"; // <-- keep this path correct for YOUR repo
import { addDoc, collection, getDoc, doc, serverTimestamp } from "firebase/firestore";

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const start = async () => {
    setErr("");

    const sName = (studentName || "").trim();
    const sEmail = (supervisorEmail || "").trim();

    if (!sName) {
      setErr("Please enter the student name.");
      return;
    }
    if (!isEmail(sEmail)) {
      setErr("Please enter a valid supervisor email.");
      return;
    }

    setSaving(true);
    try {
      // 1) Create doc with addDoc and keep the TRUE id from Firestore
      const ref = await addDoc(collection(db, "envelopes"), {
        unitCode: "AURTTE104",
        status: "awaiting_student",
        studentName: sName,
        supervisorEmail: sEmail,
        studentEmail: null,
        assessorEmail: null,
        studentSignature: null,
        supervisorSignature: null,
        assessorSignature: null,
        outcome: null,
        checklist: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newId = ref.id;

      // 2) Confirm the doc is actually readable before we redirect (handles eventual consistency/CDN)
      let found = false;
      for (let i = 0; i < 6; i++) { // up to ~1.8s
        const snap = await getDoc(doc(db, "envelopes", newId));
        if (snap.exists()) {
          found = true;
          break;
        }
        await new Promise(r => setTimeout(r, 300));
      }

      // 3) Redirect with the Firestore ID
      const base = `${window.location.origin}/`;
      const dest = `${base}?id=${encodeURIComponent(newId)}&role=student`;
      if (!found) {
        // redirect anyway—Student page will retry fetch a few times too
        console.warn("[StartStudent] Created but not immediately visible. Redirecting.");
      }
      window.location.href = dest;
    } catch (e) {
      console.error(e);
      setErr("Could not start the declaration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Start Declaration – AURTTE104
      </h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Student name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Jane Doe"
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
          />
        </div>

        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        <button
          onClick={start}
          disabled={saving}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Starting…" : "Start"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        This is the only link you place in aXcelerate. Each student gets a unique workflow.
      </p>
    </div>
  );
}
