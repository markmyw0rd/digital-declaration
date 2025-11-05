import jsPDF from "jspdf";
import "jspdf-autotable";

export async function buildFinalPDF(d) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 36;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Allora College — Digital Declaration (AURTTE104)", margin, margin);

  // Datestamp
  const f = new Date();
  const ts = `${f.getDate().toString().padStart(2,"0")}/${(f.getMonth()+1)
    .toString().padStart(2,"0")}/${f.getFullYear()}, ${f
    .toTimeString()
    .substring(0,8)}`;
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${ts}`, 460, margin, { align: "right" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(16);
  doc.text("AURTTE104 – Digital Declaration (Final)", margin, margin + 32);
  doc.setTextColor(0, 0, 0);

  let y = margin + 60;

  const section = (title) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin, y);
    y += 8;
    doc.setDrawColor(220); doc.line(margin, y, 559, y); y += 12;
  };

  const sigBox = async (label, dataUrl) => {
    doc.setFont("helvetica", "bold"); doc.text(label, margin, y);
    if (dataUrl) {
      doc.setDrawColor(220); doc.rect(margin, y + 8, 300, 120);
      try { doc.addImage(dataUrl, "PNG", margin + 6, y + 14, 288, 108); } catch {}
    } else {
      doc.setDrawColor(220); doc.rect(margin, y + 8, 300, 120);
    }
    y += 140 + 12;
  };

  section("Student’s Declaration");
  await sigBox("Signature", d.studentSig);

  section("Supervisor’s Declaration");
  await sigBox("Signature", d.supervisorSig);

  section("Assessor’s Declaration");
  doc.setFont("helvetica", "bold");
  doc.text(`Outcome: `, margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(d.outcome || "-", margin + 60, y);
  y += 12;
  await sigBox("Signature", d.assessorSig);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "© Allora College — Workplace Training and Assessment",
    margin,
    812
  );

  doc.save(`Declaration-${d?.studentName || "Student"}-AURTTE104.pdf`);
}
