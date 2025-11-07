// src/pages/StudentForm.js
import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function StudentForm() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const role = params.get("role") || "student";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        console.log("[StudentForm] id =", id, "| role =", role);
        if (!id) throw new Error("Missing id");
        // ✅ read from declarations
        const snap = await getDoc(doc(db, "declarations", id));
        if (!snap.exists()) {
          console.warn("[StudentForm] Document does not exist:", id);
          setErr("not_found");
          return;
        }
        setData({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error(e);
        setErr("load_error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, role]);

  const submitStudent = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "declarations", data.id), {
        status: "awaiting_supervisor",
        studentSubmittedAt: serverTimestamp(),
      });
      // go to supervisor link preview for convenience (your flow may email instead)
      window.location.assign(`/?id=${data.id}&role=supervisor`);
    } catch (e) {
      console.error(e);
      alert("Could not submit form.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (err === "not_found")
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">
          Record not found. The link may be invalid or expired.
        </p>
        <a href="/" className="inline-block mt-3 bg-emerald-600 text-white px-3 py-1 rounded">
          Back to start
        </a>
      </div>
    );
  if (err) return <p className="p-6 text-red-600">Could not load.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Student Declaration</h2>
      <p className="text-sm text-gray-600">Student: {data.studentName}</p>
      {/* your real fields here */}
      <button
        onClick={submitStudent}
        className="bg-emerald-600 text-white rounded px-4 py-2"
      >
        Submit as Student
      </button>
    </div>
  );
}
