// src/components/StudentForm.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import SignaturePad from "./SignaturePad";          // your existing canvas component
import { notifySupervisor } from "../lib/notify";   // calls Cloud Function

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function StudentForm() {
  const id = useMemo(() => getParam("id"), []);
  const padRef = useRef(null);

  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load envelope
  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists() && active) setData({ id: snap.id, ...snap.data() });
    }
    load();
    return () => (active = false);
  }, [id]);

  const isLocked =
    data?.status && data.status !== "awaiting_student"; // lock after submit

  const handleSave = async () => {
    if (!padRef.current) return;
    if (padRef.current.isEmpty()) {
      alert("Please sign in the box.");
      return;
    }

    setSaving(true);
    try {
      // get signature as data URL (PNG)
      const dataUrl = padRef.current.toDataURL();

      await updateDoc(doc(db, "envelopes", id), {
        studentSig: dataUrl,
        studentSignedAt: serverTimestamp(),
        status: "awaiting_supervisor",
      });

      // Email supervisor (server-side via Cloud Function)
      const actionLink = `${window.location.origin}/?id=${encodeURIComponent(
        id
      )}&role=supervisor`;

      try {
        await notifySupervisor({
          to: data.supervisorEmail,
          studentName: data.studentName || "-",
          unitCode: data.unitCode || "AURTTE104",
          actionLink,
        });
        alert("Submitted. Supervisor will be notified.");
      } catch (mailErr) {
        console.error(mailErr);
        alert(
          "Submitted. Failed to send email automatically—please contact IT."
        );
      }

      // reload current record to reflect new status
      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error(err);
      alert("Could not save signature.");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Digital Declaration – {data.unitCode || "AURTTE104"}
      </h1>

      <div className="text-sm text-gray-600 mb-6">
        <p>
          <strong>Student:</strong> {data.studentName || "-"}
        </p>
        <p className="mt-1">
          <strong>Status:</strong> {data.status || "-"}{" "}
          <span className="text-gray-400">·</span>{" "}
          <strong>Current role view:</strong> student
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Student Declaration</h2>
        <p className="text-gray-700 mb-4">
          I confirm that I can perform the required workplace tasks to industry
          standard, independently and without additional supervision or
          training.
        </p>

        <div className="border rounded-lg p-4">
          <p className="font-medium mb-2">Student Signature</p>

          <SignaturePad
            ref={padRef}
            disabled={isLocked}
            height={260}
            className="w-full border rounded bg-gray-50"
          />

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => padRef.current?.clear()}
              disabled={isLocked}
              className="px-3 py-2 rounded border"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isLocked || saving}
              className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Submit & Notify Supervisor"}
            </button>
          </div>

          {isLocked && (
            <p className="text-xs text-gray-500 mt-3">
              Locked after submission.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
