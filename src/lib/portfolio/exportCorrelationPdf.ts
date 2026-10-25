import type { CorrelationCell } from "./correlation";
import { correlationInclusiveEndDate, MIN_CORRELATION_OBSERVATIONS } from "./correlation";

interface MatrixExport {
  holdings: { symbol: string; temporary?: boolean }[];
  matrix: CorrelationCell[][];
  startDate: string;
  endDate: string;
}

export async function createCorrelationPdf({ holdings, matrix, startDate, endDate }: MatrixExport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const label = (index: number) => holdings[index].symbol + (holdings[index].temporary ? " *" : "");
  doc.setTextColor(30);
  doc.setFontSize(15);
  doc.text("JSOSIF | Portfolio Correlation Matrix", 10, 12);
  doc.setFontSize(8);
  doc.text(`${startDate} to ${correlationInclusiveEndDate(endDate)} | Daily adjusted returns | Yahoo Finance`, 10, 19);
  doc.text(`Fixed income and cash excluded. Minimum ${MIN_CORRELATION_OBSERVATIONS} matching observations. FX movements into CAD excluded.`, 10, 25);
  doc.text("-1: opposite movement | 0: no linear relationship | +1: same movement | N/A: insufficient history or no variation", 10, 31);
  doc.text(`* Temporary stock added to this chart. ${holdings.length} stocks.`, 10, 37);

  if (holdings.length > 0) {
    // Draw the entire matrix as vector cells on one page, scaling text to fit.
    const top = 65;
    const rowHeight = Math.min(9, (194 - top) / holdings.length);
    const labelFont = Math.min(8, rowHeight * 1.7);
    doc.setFontSize(labelFont);
    const labelWidth = Math.max(22, ...holdings.map((_, index) => doc.getTextWidth(label(index)) + 4));
    const left = 10 + labelWidth;
    const cellWidth = (287 - left) / holdings.length;
    doc.setFontSize(8);
    const valueFont = Math.min(8, rowHeight * 1.7, 8 * cellWidth * 0.85 / doc.getTextWidth("-1.00"));
    const longestHeader = Math.max(...holdings.map((_, index) => doc.getTextWidth(label(index))));
    const headerFont = Math.min(8, 8 * 22 / longestHeader, cellWidth * 1.7);

    doc.setTextColor(70);
    doc.setFontSize(headerFont);
    holdings.forEach((_, column) => {
      doc.text(label(column), left + cellWidth * (column + 0.5), top - 2, { angle: 90 });
    });
    holdings.forEach((_, row) => {
      const y = top + row * rowHeight;
      doc.setTextColor(70);
      doc.setFontSize(labelFont);
      doc.text(label(row), left - 2, y + rowHeight / 2, { align: "right", baseline: "middle" });
      matrix[row].forEach((cell, column) => {
        const value = cell.value;
        const target = value !== null && value < 0 ? [190, 65, 75] : [14, 87, 145];
        const fillColor: [number, number, number] = value === null ? [241, 245, 249] : target.map((channel) => Math.round(255 + (channel - 255) * Math.abs(value))) as [number, number, number];
        const x = left + column * cellWidth;
        doc.setFillColor(...fillColor);
        doc.setDrawColor(255);
        doc.setLineWidth(0.1);
        doc.rect(x, y, cellWidth, rowHeight, "FD");
        doc.setFontSize(valueFont);
        doc.setTextColor(value !== null && Math.abs(value) > 0.65 ? 255 : 51);
        doc.text(value === null ? "N/A" : value.toFixed(2), x + cellWidth / 2, y + rowHeight / 2, { align: "center", baseline: "middle" });
      });
    });
  }
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text("Page 1 of 1", 287, 202, { align: "right" });
  return doc;
}

export async function exportCorrelationPdf(data: MatrixExport) {
  const doc = await createCorrelationPdf(data);
  doc.save(`JSOSIF-portfolio-correlation-${data.startDate}-to-${correlationInclusiveEndDate(data.endDate)}.pdf`);
}
