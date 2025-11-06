import React, { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase"; // ✅ ensure this path is correct
import { doc, getDoc } from "firebase/firestore";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export default function StudentForm() {
  const id = useMemo(() => getParam("id"), []);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | not_found | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) {
        setStatus("not_found");
        setMessage("Missing id parameter in the URL.");
        return;
      }

      try {
        console.log("[StudentForm] Fetching envelope id =", id);
        const snap = await getDoc(doc(db, "envelopes", id));
        if (!active) return;

        if (!snap.exists()) {
          console.warn("[StudentForm] Document does not exist:", id);
          setStatus("not_found");
          setMessage(
            "Record not found. The link may be invalid or expired. Create a new declaration from the start page."
          );
          return;
        }

        setData({ id: snap.id, ...snap.data() });
        setStatus("ready");
      } catch (e) {
        console.error(e);
        setStatus("error");
        setMessage("Could not load the record.");
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 font-medium">{message}</p>
        <a
          href={`${window.location.origin}/`}
          className="inline-block mt-4 px-3 py-2 rounded bg-emerald-600 text-white"
        >
          Back to start
        </a>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 font-medium">{message}</p>
      </div>
    );
  }

  // ====== Your actual student UI goes here ======
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

      {/* … your student signature UI … */}
      <div className="bg-white rounded-xl shadow p-6">
        <p>Continue with the student declaration here…</p>
      </div>
    </div>
  );
}
