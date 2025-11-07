// src/pages/SupervisorForm.js
import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function SupervisorForm() {
  const id = new URLSearchParams(window.location.search).get("id");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "declarations", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();
  }, [id]);

  const submitSupervisor = async () => {
    await updateDoc(doc(db, "declarations", data.id), {
      status: "awaiting_assessor",
      supervisorSubmittedAt: serverTimestamp(),
    });
    window.location.assign(`/?id=${data.id}&role=assessor`);
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (!data) return <p className="p-6 text-red-600">Not found.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Supervisor Section</h2>
      {/* fields */}
      <button
        onClick={submitSupervisor}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Submit as Supervisor
      </button>
    </div>
  );
}
