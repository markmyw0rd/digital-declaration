import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import SignaturePad from "./SignaturePad";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function StudentForm() {
  const id = useMemo(() => getParam("id"), []);
  const padRef = useRef(null);

  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | not_found

  useEffect(() => {
    let active = true;

    (async () => {
      if (!id) {
        if (active) setStatus("not_found");
        return;
      }

      // Try a few times before we give up (handles create-then-redirect timing)
      let snap = null;
      for (let i = 0; i < 6; i++) { // ~1.8s
        try {
          const s = await getDoc(doc(db, "envelopes", id));
          if (s.exists()) {
            snap = s;
            break;
          }
        } catch (e) {
          console.warn("[StudentForm] read error", e);
        }
        await new Promise(r => setTimeout(r, 300));
      }

      if (!active) return;

      if (snap && snap.exists()) {
        setData({ id: snap.id, ...snap.data() });
        setStatus("ready");
      } else {
        setStatus("not_found");
      }
    })();

    return () => { active = false; };
  }, [id]);

  if (status === "loading") {
    return <div className="max-w-3xl mx-auto p-6">Loading…</div>;
  }

  if (status === "not_found") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-red-600 font-medium">
          Record not found. The link may be invalid or expired.
        </p>
        <a
          href="/"
          className="inline-block mt-4 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Back to start
        </a>
      </div>
    );
  }

  const isLocked = data.status !== "awaiting_student";

  const submit = async () => {
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
        studentSignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // fetch fresh
      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
      alert("Submitted. Please forward the link to the supervisor.");
    } catch (e) {
      console.error(e);
      alert("Could not save student signature.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">
        Digital Declaration – {data.unitCode || "AURTTE104"}
      </h1>

      <div className="text-sm text-gray-600 mb-6">
        <p><strong>Student:</strong> {data.studentName || "-"}</p>
        <p className="mt-1">
          <strong>Status:</strong> {data.status || "-"}{" "}
          <span className="text-gray-400">·</span>{" "}
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
