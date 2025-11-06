import React, { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import SignaturePad from "./SignaturePad";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function StudentForm() {
  const id = useMemo(() => getParam("id") || "", []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) {
        setErr("Missing link id.");
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
        console.error("[StudentForm] Read error:", e);
        setErr("read_error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;

  if (err === "not_found")
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium mb-2">
          Record not found. The link may be invalid or expired.
        </p>
        <a href="/" className="text-emerald-700 underline">
          Create a new declaration from the start page.
        </a>
      </div>
    );

  if (err)
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium mb-2">Could not open this record.</p>
        <a href="/" className="text-emerald-700 underline">
          Go back to start
        </a>
      </div>
    );

  // ===== Example student signing UI (adjust to your fields) =====
  const [saving, setSaving] = useState(false);
  const [sigDataUrl, setSigDataUrl] = useState(null);

  const onSubmit = async () => {
    if (!sigDataUrl) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "envelopes", data.id), {
        studentSignature: sigDataUrl,
        status: "awaiting_supervisor",
        updatedAt: serverTimestamp(),
      });

      // After student signs, move to supervisor view
      const u = new URL(window.location.href);
      u.searchParams.set("role", "supervisor");
      window.location.replace(`${u.origin}${u.pathname}?${u.searchParams.toString()}`);
    } catch (e) {
      console.error("[StudentForm] Update error:", e);
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
        <p>
          <strong>Student:</strong> {data.studentName || "-"}
        </p>
        <p className="mt-1">
          <strong>Status:</strong> {data.status || "-"}{" "}
          <span className="text-gray-400">·</span>{" "}
          <strong>Current role view:</strong> student
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="border rounded-lg p-4">
          <p className="font-medium mb-2">Student Signature</p>
          <SignaturePad
            onChange={(dataUrl) => setSigDataUrl(dataUrl)}
            height={220}
            className="w-full border rounded bg-gray-50"
          />
          <div className="mt-3">
            <button
              onClick={onSubmit}
              disabled={saving || !sigDataUrl}
              className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
