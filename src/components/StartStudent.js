// StartStudent.js
import { useState } from "react";
import { db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function StartStudent() {
  const [studentName, setStudentName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const unitCode = "AURTTE104";

  async function handleStart(e) {
    e.preventDefault();

    // 1) Create ENVELOPE first
    const envRef = await addDoc(collection(db, "envelopes"), {
      studentName,
      supervisorEmail,
      unitCode,
      assessorSignature: null,
      status: "awaiting_student",
      createdAt: serverTimestamp(),
      checklist: [],
      outcome: null,
    });

    const envelopeId = envRef.id;
    console.log("[Start] Created envelope:", envelopeId);

    // 2) (Optional) Create a DECLARATION that references the envelope
    const decRef = await addDoc(collection(db, "declarations"), {
      envelopeId,
      studentName,
      supervisorEmail,
      unitCode,
      createdAt: serverTimestamp(),
      status: "awaiting_student",
    });
    console.log("[Start] Created declaration:", decRef.id);

    // 3) Redirect using the ENVELOPE ID (NOT the declaration id)
    window.location.assign(`/?id=${encodeURIComponent(envelopeId)}&role=student`);
  }

  return (
    <form onSubmit={handleStart} className="space-y-4">
      {/* your inputs... */}
    </form>
  );
}
