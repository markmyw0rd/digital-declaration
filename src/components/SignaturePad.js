import React, { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";

export default function SignaturePadField({ value, onChange, disabled = false, height = 220 }) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  // initialize the signature pad
  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = height * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      if (value) {
        try {
          padRef.current.fromDataURL(value);
        } catch {}
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const pad = new SignaturePad(canvas, {
      minWidth: 0.8,
      maxWidth: 2.2,
      penColor: "#111",
    });
    padRef.current = pad;

    pad.onEnd = () => {
      if (onChange) onChange(pad.toDataURL("image/png"));
    };

    if (value) {
      try {
        pad.fromDataURL(value);
      } catch {}
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      pad.off(); // safely cleanup
    };
  }, []);

  // lock/unlock drawing
  useEffect(() => {
    if (!padRef.current) return;
    padRef.current.off();
    if (!disabled) {
      padRef.current.on();
    }
  }, [disabled]);

  // if parent updates signature
  useEffect(() => {
    if (padRef.current && value) {
      try {
        padRef.current.fromDataURL(value);
      } catch {}
    }
  }, [value]);

  const handleClear = () => {
    if (!padRef.current) return;
    padRef.current.clear();
    onChange && onChange("");
  };

  return (
    <div>
      <div className="border rounded bg-white">
        <canvas ref={canvasRef} style={{ width: "100%", height }} />
      </div>
      {!disabled && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded border text-sm"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
