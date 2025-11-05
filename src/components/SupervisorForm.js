// src/components/SupervisorForm.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import SignaturePad from "./SignaturePad";
import { notifyAssessor } from "../lib/notify";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function SupervisorForm() {
  const id = useMemo(() => getParam("id"), []);
  const padRef = useRef(null);

  const [data, setData] = useState(null);
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [assessorEmail, setAssessorEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists() && active) {
        const d = { id: snap.id, ...snap.data() };
        setData(d);
        setSupervisorEmail(d.supervisorEmail || "");
        setAssessorEmail(d.assessorEmail || "");
      }
    })();
    return () => (active = false);
  }, [id]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Loading…</div>;

  const isLocked = data.status !== "awaiting_supervisor";

  const submit = async () => {
    if (isLocked) return;
    if (!assessorEmail.trim()) {
      alert("Please enter the assessor email.");
      return;
    }
    if (!padRef.current || padRef.current.isEmpty()) {
      alert("Please sign in the box.");
      return;
    }

    setSaving(true);
    try {
      const sig = padRef.current.toDataURL();

      await updateDoc(doc(db, "envelopes", id), {
        supervisorSig: sig,
        supervisorEmail: supervisorEmail || data.supervisorEmail || "",
        assessorEmail,
        supervisorSignedAt: serverTimestamp(),
        status: "awaiting_assessor",
      });

      const actionLink = `${window.location.origin}/?id=${encodeURIComponent(
        id
      )}&role=assessor`;

      try {
        await notifyAssessor({
          to: assessorEmail,
          studentName: data.studentName || "-",
          unitCode: data.unitCode || "AURTTE104",
          actionLink,
        });
        alert("Submitted. Assessor will be notified.");
      } catch (e) {
        console.error(e);
        alert(
          "Submitted, but failed to email the assessor automatically."
        );
      }

      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error(err);
      alert("Could not save supervisor signature.");
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
        <p>
          <strong>Student:</strong> {data.studentName || "-"}
        </p>
        <p className="mt-1">
          <strong>Status:</strong> {data.status || "-"}{" "}
          <span className="text-gray-400">·</span>{" "}
          <strong>Current role view:</strong> supervisor
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Supervisor email</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={supervisorEmail}
            disabled={isLocked}
            onChange={(e) => setSupervisorEmail(e.target.value)}
            placeholder="supervisor@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Assessor email</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={assessorEmail}
            disabled={isLocked}
            onChange={(e) => setAssessorEmail(e.target.value)}
            placeholder="assessor@example.com"
          />
        </div>

        <div className="border rounded-lg p-4">
          <p className="font-medium mb-2">Supervisor Signature</p>
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
              {saving ? "Saving…" : "Submit & Notify Assessor"}
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
