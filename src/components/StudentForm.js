import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

function useQuery() {
  return new URLSearchParams(window.location.search);
}

export default function StudentForm() {
  const q = useQuery();
  const id = q.get("id") || "";
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        console.log("[StudentForm] Fetching envelope id =", id);
        const ref = doc(db, "envelopes", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          console.warn("[StudentForm] Document does not exist:", id);
          setNotFound(true);
        } else {
          setData({ id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
        setErr("Could not load the declaration.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const signStudent = async () => {
    if (!data) return;
    try {
      await updateDoc(doc(db, "envelopes", data.id), {
        "checklist.studentSigned": true,
        status: "awaiting_supervisor",
        updatedAt: serverTimestamp(),
      });
      alert("Signed. Supervisor will be notified next.");
    } catch (e) {
      console.error(e);
      setErr("Could not submit signature.");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  if (notFound) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium mb-3">
          Record not found. The link may be invalid or expired.
        </p>
        <a
          href="/"
          className="inline-block rounded bg-emerald-600 text-white px-4 py-2"
        >
          Back to start
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Student Declaration</h1>
      <div className="rounded border p-4">
        <p className="text-sm text-gray-600">
          Unit: <b>{data?.unitCode || "AURTTE104"}</b>
        </p>
        <p className="text-sm text-gray-600">
          Student: <b>{data?.studentName}</b>
        </p>
        <p className="text-sm text-gray-600">
          Supervisor: <b>{data?.supervisorEmail}</b>
        </p>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button
        onClick={signStudent}
        className="w-full rounded bg-emerald-600 text-white py-2"
      >
        Sign as Student
      </button>
    </div>
  );
}
