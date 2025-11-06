import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import SignaturePad from "./SignaturePad";

function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

export default function StudentForm() {
  const id = useMemo(() => getParam("id"), []);
  const padRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) { setError("Missing record id."); return; }
        const snap = await getDoc(doc(db, "envelopes", id));
        if (!alive) return;

        if (!snap.exists()) {
          setError("Record not found. The link may be invalid or expired.");
          return;
        }
        setData({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error("Load envelope failed:", e);
        setError("Could not load this record. Please retry.");
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (error) return <div className="max-w-3xl mx-auto p-6 text-red-600">{error}</div>;
  if (!data)  return <div className="max-w-3xl mx-auto p-6">Loading…</div>;

  const isLocked = data.status !== "awaiting_student";

  async function submit() {
    if (isLocked) return;
    if (!padRef.current || padRef.current.isEmpty()) {
      alert("Please sign in the box.");
      return;
    }

    setSaving(true);
    try {
      const sig = padRef.current.toDataURL();
      await updateDoc(doc(db, "envelopes", id), {
        studentSignature: sig,
        status: "awaiting_supervisor",
        updatedAt: serverTimestamp(),
      });

      // reload to reflect new state
      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
      alert("Submitted. The supervisor can now sign.");
    } catch (err) {
      console.error(err);
      alert("Could not save student signature.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Digital Declaration – {data.unitCode || "AURTTE104"}
      </h1>

      <div className="text-sm text-gray-600 mb-6">
        <p><strong>Student:</strong> {data.studentName || "-"}</p>
        <p className="mt-1">
          <strong>Status:</strong> {data.status || "-"} <span className="text-gray-400">·</span>{" "}
          <strong>Current role view:</strong> student
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="font-medium mb-2">Student Signature</p>
        <SignaturePad
          ref={padRef}
          disabled={isLocked}
          height={220}
          className="w-full border rounded bg-gray-50"
        />

        <div className="mt-3">
          <button
            onClick={submit}
            disabled={isLocked || saving}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Submit"}
          </button>
        </div>

        {isLocked && (
          <p className="text-xs text-gray-500 mt-3">
            Locked after submission.
          </p>
        )}
      </div>
    </div>
  );
}
