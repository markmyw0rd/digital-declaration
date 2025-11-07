// src/pages/AssessorForm.js
import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AssessorForm() {
  const id = new URLSearchParams(window.location.search).get("id");
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "declarations", id));
      if (snap.exists()) setData({ id: snap.id, ...snap.data() });
    })();
  }, [id]);

  const finish = async () => {
    await updateDoc(doc(db, "declarations", data.id), {
      status: "complete",
      assessorSubmittedAt: serverTimestamp(),
    });
    alert("All done!");
    window.location.assign("/");
  };

  if (!data) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Assessor Section</h2>
      {/* fields */}
      <button onClick={finish} className="bg-indigo-600 text-white rounded px-4 py-2">
        Finalise
      </button>
    </div>
  );
}
