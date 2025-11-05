// src/lib/canvasTrim.js
// Trim transparent edges from a canvas (no external deps)
export function trimTransparentCanvas(source, padding = 8) {
  const { width, height } = source;
  const ctx = source.getContext('2d');
  const { data } = ctx.getImageData(0, 0, width, height);

  let top = height, left = width, right = 0, bottom = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3]; // alpha
      if (a !== 0) {
        found = true;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  // Nothing drawn → return original canvas
  if (!found) return source;

  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);

  const w = right - left + 1;
  const h = bottom - top + 1;

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  out.getContext('2d').drawImage(source, left, top, w, h, 0, 0, w, h);
  return out;
}
