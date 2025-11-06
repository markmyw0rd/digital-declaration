import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import SignaturePad from "./SignaturePad";
import { notifySupervisor } from "../lib/notify";

function qp(name) {
  try {
    return new URL(window.location.href).searchParams.get(name);
  } catch {
    return null;
  }
}

export default function StudentForm() {
  const id = useMemo(() => qp("id"), []);
  const padRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) {
        setErr("Missing id");
        setLoading(false);
        return;
      }
      try {
        console.log("[StudentForm] Fetching envelope id =", id);
        const snap = await getDoc(doc(db, "envelopes", id));
        if (!snap.exists()) {
          console.warn("[StudentForm] Document does not exist:", id);
          setErr("not_found");
        } else {
          setData({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error("[StudentForm] getDoc error:", e);
        setErr(e.message || "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto p-6">Loading…</div>;
  if (err === "not_found")
    return (
      <div className="max-w-3xl mx-auto p-6 text-red-600">
        <p className="font-semibold">
          Record not found. The link may be invalid or expired.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Create a new declaration from the start page.
        </p>
      </div>
    );
  if (err) return <div className="max-w-3xl mx-auto p-6">Error: {String(err)}</div>;
  if (!data) return null;

  const isLocked = data.status !== "awaiting_student";

  const submit = async () => {
    if (isLocked) return;
    if (!padRef.current || padRef.current.isEmpty()) {
      alert("Please sign in the box.");
      return;
    }
    try {
      const sig = padRef.current.toDataURL();
      await updateDoc(doc(db, "envelopes", id), {
        studentSig: sig,
        studentSignedAt: serverTimestamp(),
        status: "awaiting_supervisor",
      });

      const link = `${window.location.origin}/?id=${encodeURIComponent(
        id
      )}&role=supervisor`;

      try {
        await notifySupervisor({
          to: data.supervisorEmail,
          studentName: data.studentName || "-",
          unitCode: data.unitCode || "AURTTE104",
          actionLink: link,
        });
        alert("Submitted. Supervisor will be notified.");
      } catch (e) {
        console.error(e);
        alert("Submitted, but failed to email the supervisor automatically.");
      }

      const snap = await getDoc(doc(db, "envelopes", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
    } catch (e) {
      console.error(e);
      alert("Could not save student signature.");
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
            disabled={isLocked}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Submit & Notify Supervisor
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
