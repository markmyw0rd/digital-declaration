import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import SignaturePad from "./SignaturePad";
import { notifyFinal } from "../lib/notify";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function AssessorForm() {
  const id = useMemo(() => getParam("id"), []);
  const padRef = useRef(null);

  const [data, setData] = useState(null);
  const [outcome, setOutcome] = useState("competent");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!id) { setError("Missing record id."); return; }
        const snap = await getDoc(doc(db, "envelopes", id));
        if (!active) return;
        if (snap.exists()) {
          const d = { id: snap.id, ...snap.data() };
          setData(d);
          setOutcome(d.outcome || "competent");
        } else {
          setError("Record not found. The link may be invalid or expired.");
        }
      } catch (e) {
        console.error(e);
        setError("Could not load this record. Please retry.");
      }
    })();
    return () => (active = false);
  }, [id]);

  if (error) return <div className="max-w-3xl mx-auto p-6 text-red-600">{error}</div>;
  if (!data) return <div className="max-w-3xl mx-auto p-6">Loading…</div>;

  const isLocked = data.status === "completed";

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
        assessorSignature: sig,
        outcome,
        assessorSignedAt: serverTimestamp(),
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      const finalLink = `${window.location.origin}/?id=${encodeURIComponent(
        id
      )}&role=student`; // or a dedicated "view" route

      const recipients = [
        data.studentEmail,           // optional if stored
        data.supervisorEmail,
        data.assessorEmail,
      ].filter(Boolean);

      try {
        if (recipients.length) {
          await notifyFinal({ recipients, finalLink });
        }
        alert("Declaration completed.");
      } catch (e) {
        console.error(e);
        alert("Completed, but failed to send final emails automatically.");
      }

      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error(err);
      alert("Could not save assessor signature.");
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
          <strong>Status:</strong> {data.status || "-"} <span className="text-gray-400">·</span>{" "}
          <strong>Current role view:</strong> assessor
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Outcome (tick one)</label>
          <div className="mt-2 flex gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="outcome"
                value="competent"
                disabled={isLocked}
                checked={outcome === "competent"}
                onChange={() => setOutcome("competent")}
              />
              Competent
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="outcome"
                value="nyc"
                disabled={isLocked}
                checked={outcome === "nyc"}
                onChange={() => setOutcome("nyc")}
              />
              Not Yet Competent
            </label>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <p className="font-medium mb-2">Assessor Signature</p>
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
              {saving ? "Saving…" : "Submit & Complete"}
            </button>
          </div>

          {isLocked && (
            <p className="text-xs text-gray-500 mt-3">
              Completed – record is locked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
