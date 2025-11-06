import React, { useMemo, useState } from "react";
import { db } from "../lib/firebase"; // ✅ ensure this path is correct
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Small helper: promise-based sleep
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Re-read the doc a few times to make sure it’s visible
  const waitForExists = async (dref, retries = 6) => {
    for (let i = 0; i < retries; i++) {
      const snap = await getDoc(dref);
      if (snap.exists()) return snap;
      await sleep(200 * (i + 1)); // backoff: 200ms, 400ms, ...
    }
    throw new Error("Document not visible after write");
  };

  const handleStart = async () => {
    setErr("");

    const name = (studentName || "").trim();
    const sup = (supervisorEmail || "").trim();

    if (!name) {
      setErr("Please enter the student name.");
      return;
    }
    // We won't block on a strictly valid email to keep testing easy.
    // If you want to enforce format, add a simple regex here later.

    setSaving(true);
    try {
      // 1) Pre-create a doc ref to get a stable ID
      const cRef = collection(db, "envelopes");
      const dRef = doc(cRef); // auto-ID here, BEFORE write
      const id = dRef.id;

      // 2) Write the initial envelope
      const payload = {
        unitCode: "AURTTE104",
        status: "awaiting_student",
        studentName: name,
        supervisorEmail: sup || "",
        // signatures
        studentSignature: null,
        supervisorSignature: null,
        assessorSignature: null,
        // outcomes
        outcome: null,
        checklist: {},
        // simple tokens if you later want routing links
        supToken: Math.random().toString(36).slice(2),
        assToken: Math.random().toString(36).slice(2),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(dRef, payload);

      // 3) Verify the write is visible
      const verified = await waitForExists(dRef);
      if (!verified.exists()) {
        throw new Error("Write verification failed");
      }

      // Helpful logs (and sanity check project id)
      // eslint-disable-next-line no-console
      console.log("[StartStudent] Created envelope id =", id);

      // 4) Only redirect after verification
      const url = `${window.location.origin}/?id=${encodeURIComponent(
        id
      )}&role=student`;
      window.location.assign(url);
    } catch (e) {
      console.error(e);
      setErr(
        "Could not start the declaration. Please try again (or check Firebase config)."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-4">
        Start Declaration – AURTTE104
      </h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Student name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Mark Alvin Mabayo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Supervisor email</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={supervisorEmail}
            onChange={(e) => setSupervisorEmail(e.target.value)}
            placeholder="supervisor@example.com"
          />
        </div>

        {err && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
            {err}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={saving}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Creating…" : "Start"}
        </button>

        <p className="text-xs text-gray-500">
          This creates a single Firestore record and then redirects with that
          record’s id.
        </p>
      </div>
    </div>
  );
}
