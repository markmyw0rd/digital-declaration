import { db } from "./firebase";
import {
  addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, getDoc,
} from "firebase/firestore";

// Simple token (good enough for this use)
export function generateToken(len = 32) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let t = "";
  for (let i = 0; i < len; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

// Create a new envelope when the student starts
export async function createEnvelope({ unitCode = "AURTTE104", studentName, supervisorEmail }) {
  const supToken = generateToken();
  const assToken = generateToken();

  const ref = await addDoc(collection(db, "envelopes"), {
    unitCode,
    status: "awaiting_student",
    // people & routing
    studentName: studentName || "",
    supervisorEmail: supervisorEmail || "",
    // signatures
    studentSignature: null,
    supervisorSignature: null,
    assessorSignature: null,
    // outcomes
    outcome: null,
    checklist: {},
    // tokens used in emailed links
    supToken,
    assToken,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, supToken, assToken };
}

// Live subscribe to one envelope
export function watchEnvelope(id, cb) {
  const dref = doc(db, "envelopes", id);
  return onSnapshot(dref, (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...snap.data() });
  });
}

// Student signs → move to supervisor
export async function submitStudent(id, { studentSignature }) {
  const dref = doc(db, "envelopes", id);
  await updateDoc(dref, {
    studentSignature,
    status: "awaiting_supervisor",
    updatedAt: serverTimestamp(),
  });
}

// Supervisor signs (must present correct token) → move to assessor
export async function submitSupervisor(id, { supervisorSignature }) {
  const dref = doc(db, "envelopes", id);
  await updateDoc(dref, {
    supervisorSignature,
    status: "awaiting_assessor",
    updatedAt: serverTimestamp(),
  });
}

// Assessor completes → done
export async function completeAssessor(id, { assessorSignature, outcome, checklist }) {
  const dref = doc(db, "envelopes", id);
  await updateDoc(dref, {
    assessorSignature,
    outcome,
    checklist: checklist || {},
    status: "completed",
    updatedAt: serverTimestamp(),
  });
}
