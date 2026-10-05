import type { AgreementDocument } from "@/lib/deals";

export async function downloadAgreementPdf(agreement: AgreementDocument) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 16;
  const innerL = margin + 8;
  const innerR = pageW - margin - 8;
  const width = innerR - innerL;
  let y = margin + 10;

  pdf.setDrawColor(30, 30, 30);
  pdf.setLineWidth(0.35);
  pdf.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);

  pdf.setFillColor(17, 17, 17);
  pdf.roundedRect(innerL, y, 8, 8, 1, 1, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("A", innerL + 4, y + 5.5, { align: "center" });

  pdf.setTextColor(17, 17, 17);
  pdf.setFontSize(12);
  pdf.text("Ahd", innerL + 11, y + 5.6);

  pdf.setFont("times", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`ID: ${agreement.id}`, innerR, y + 3, { align: "right" });
  pdf.text(agreement.issuedAt, innerR, y + 8, { align: "right" });

  y += 18;
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.2);
  pdf.line(innerL, y, innerR, y);

  y += 12;
  pdf.setTextColor(17, 17, 17);
  pdf.setFont("times", "bold");
  pdf.setFontSize(16);
  pdf.text(agreement.title, pageW / 2, y, { align: "center" });
  y += 8;
  pdf.setFont("times", "italic");
  pdf.setFontSize(11);
  const subjectLines = pdf.splitTextToSize(agreement.subject, width);
  pdf.text(subjectLines, pageW / 2, y, { align: "center" });
  y += subjectLines.length * 6 + 6;

  pdf.setFont("times", "bold");
  pdf.setFontSize(10);
  pdf.text("1. Tomonlar", innerL, y);
  y += 4;
  pdf.setDrawColor(30, 30, 30);
  pdf.setLineWidth(0.25);
  const rowH = 16;
  const colW = width / 2;
  pdf.rect(innerL, y, width, rowH);
  pdf.line(innerL + colW, y, innerL + colW, y + rowH);

  agreement.parties.slice(0, 2).forEach((party, i) => {
    const x = innerL + 4 + i * colW;
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(90, 90, 90);
    pdf.text(party.role.toUpperCase(), x, y + 5.5);
    pdf.setFont("times", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(17, 17, 17);
    pdf.text(party.name, x, y + 12);
  });
  y += rowH + 10;

  agreement.clauses
    // The built-in template's "Tomonlar" clause is replaced by the parties block above; AI clauses are kept.
    .filter((c) => !(c.number === "1" && c.title === "Tomonlar" && c.body.startsWith("Ushbu shartnoma")))
    .forEach((clause) => {
      const heading = clause.title ? `${clause.number}. ${clause.title}` : `${clause.number}.`;
      const body = pdf.splitTextToSize(clause.body, width);
      const blockH = 6 + body.length * 5 + 4;
      if (y + blockH > pageH - margin - 52) {
        pdf.addPage();
        pdf.setDrawColor(30, 30, 30);
        pdf.setLineWidth(0.35);
        pdf.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);
        y = margin + 12;
      }
      pdf.setFont("times", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(17, 17, 17);
      pdf.text(heading, innerL, y);
      y += 5.5;
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      pdf.text(body, innerL, y);
      y += body.length * 5 + 5;
    });

  if (y > pageH - margin - 48) {
    pdf.addPage();
    pdf.setDrawColor(30, 30, 30);
    pdf.setLineWidth(0.35);
    pdf.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);
    y = margin + 14;
  }

  pdf.setDrawColor(220, 220, 220);
  pdf.line(innerL, y, innerR, y);
  y += 8;
  pdf.setFont("times", "bold");
  pdf.setFontSize(10);
  pdf.text("Imzolar", innerL, y);
  y += 8;

  const sigW = (width - 8) / 2;
  agreement.parties.slice(0, 2).forEach((party, i) => {
    const x = innerL + i * (sigW + 8);
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(90, 90, 90);
    pdf.text(party.role, x, y);
    pdf.setDrawColor(17, 17, 17);
    pdf.setLineDashPattern([1.2, 1.2], 0);
    pdf.line(x, y + 14, x + sigW, y + 14);
    pdf.setLineDashPattern([], 0);

    if (party.signedAt) {
      pdf.setFont("times", "italic");
      pdf.setFontSize(14);
      pdf.setTextColor(17, 17, 17);
      pdf.text(party.name, x, y + 12);
      pdf.setFont("times", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(90, 90, 90);
      pdf.text(`Sana: ${party.signedAt}`, x, y + 19);
    } else {
      pdf.setFont("times", "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(140, 140, 140);
      pdf.text("Imzo kutilmoqda...", x, y + 12);
      pdf.setFont("times", "normal");
      pdf.setFontSize(8);
      pdf.text("Sana: —", x, y + 19);
    }
  });

  pdf.setFont("times", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(120, 120, 120);
  pdf.text(
    `Ahd · tuzilgan: ${agreement.generatedAt} · ${agreement.id}`,
    pageW / 2,
    pageH - margin - 5,
    { align: "center" },
  );

  pdf.save(`Ahd-Kelishuv-${agreement.id}.pdf`);
}
