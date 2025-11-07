// StudentForm.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StudentForm() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  const role = params.get("role") || "student";

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      console.log("[StudentForm] id =", id, "| role =", role);
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // 1) Try envelopes/<id>
      const envSnap = await getDoc(doc(db, "envelopes", id));
      if (envSnap.exists()) {
        setData({ id, ...envSnap.data() });
        setLoading(false);
        return;
      }
      console.warn("[StudentForm] Document does not exist:", id);

      // 2) If someone passed a declaration id by mistake, try to resolve it
      const decSnap = await getDoc(doc(db, "declarations", id));
      const envId = decSnap.exists() ? decSnap.data()?.envelopeId : null;

      if (envId) {
        // hard-redirect to the correct id
        window.location.replace(`/?id=${encodeURIComponent(envId)}&role=${encodeURIComponent(role)}`);
        return;
      }

      setNotFound(true);
      setLoading(false);
    })();
  }, [id, role]);

  if (loading) return <p>Loading…</p>;
  if (notFound) {
    return (
      <div className="max-w-xl m-auto p-6 text-center">
        <p className="text-red-600 font-medium">
          Record not found. The link may be invalid or expired.
        </p>
        <a className="inline-block mt-3 px-4 py-2 rounded bg-emerald-600 text-white" href="/">
          Back to start
        </a>
      </div>
    );
  }

  // ... render the real form using `data`
  return <div>{/* your existing form */}</div>;
}
