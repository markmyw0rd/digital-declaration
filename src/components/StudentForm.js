import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function StudentForm() {
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, err: "" });

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");
        const role = url.searchParams.get("role");

        console.log("[StudentForm] id =", id, "| role =", role);

        if (!id) {
          setState({ loading: false, err: "Missing id" });
          return;
        }

        const dref = doc(db, "envelopes", id);
        const snap = await getDoc(dref);

        if (!snap.exists()) {
          console.warn("[StudentForm] Document does not exist:", id);
          setState({ loading: false, err: "not_found" });
          return;
        }

        console.log("[StudentForm] Loaded:", { id: snap.id, ...snap.data() });
        setData({ id: snap.id, ...snap.data() });
        setState({ loading: false, err: "" });
      } catch (e) {
        console.error("[StudentForm] Load failed", e);
        setState({ loading: false, err: "load_failed" });
      }
    })();
  }, []);

  if (state.loading) return <p>Loading…</p>;

  if (state.err === "not_found") {
    // helpful back button (you already see this UI)
    return (
      <div className="space-y-3">
        <p className="text-red-600">
          Record not found. The link may be invalid or expired.
        </p>
        <a href={window.location.origin}>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded">
            Back to start
          </button>
        </a>
      </div>
    );
  }
  if (state.err) return <p className="text-red-600">Error: {state.err}</p>;

  // …render the actual student form with `data` here…
  return <pre className="text-sm bg-gray-50 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>;
}
