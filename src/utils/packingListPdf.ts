import { jsPDF } from "jspdf";
import type { PackingListDocument } from "./packingList";
import {
  essentialItemKey,
  packingItemKey,
  packingListFilename,
} from "./packingList";

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE = 5.5;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= PAGE_H - MARGIN) return y;
  doc.addPage();
  return MARGIN;
}

function writeLines(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE);
    doc.text(line, x, y);
    y += LINE;
  }
  return y;
}

function writeHeading(doc: jsPDF, text: string, y: number, size = 12): number {
  y = ensureSpace(doc, y, LINE + 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.text(text, MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  return y + LINE + 1;
}

function writeChecklist(
  doc: jsPDF,
  items: string[],
  checked: Record<string, boolean>,
  itemKey: (item: string, index: number) => string,
  y: number
): number {
  doc.setFontSize(10);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isChecked = checked[itemKey(item, i)] ?? false;
    const prefix = isChecked ? "[x] " : "[ ] ";
    y = ensureSpace(doc, y, LINE);
    const lines = doc.splitTextToSize(`${prefix}${item}`, CONTENT_W - 4) as string[];
    for (const line of lines) {
      y = ensureSpace(doc, y, LINE);
      doc.text(line, MARGIN + 2, y);
      y += LINE;
    }
  }
  return y + 2;
}

export function exportPackingListPdf(
  doc: PackingListDocument,
  checked: Record<string, boolean> = {}
): void {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  y = ensureSpace(pdf, y, 10);
  pdf.text(`${doc.profileName}'s packing list`, MARGIN, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  y = writeLines(pdf, doc.tripRange, MARGIN, y, CONTENT_W);
  pdf.setTextColor(0);
  y += 4;

  const hasDayItems = doc.days.some((d) => d.outfits.length > 0 || d.activities.length > 0);

  if (hasDayItems) {
    y = writeHeading(pdf, "By day", y, 13);
    for (const day of doc.days) {
      if (day.outfits.length === 0 && day.activities.length === 0) continue;

      y = writeHeading(
        pdf,
        `Day ${day.dayNumber} · ${day.dateLabel} · ${day.placeLabel}`,
        y,
        11
      );

      if (day.outfits.length > 0) {
        y = writeLines(pdf, "Outfits", MARGIN + 2, y, CONTENT_W);
        y += 1;
        for (const block of day.outfits) {
          y = writeLines(pdf, block.name, MARGIN + 4, y, CONTENT_W);
          y = writeChecklist(pdf, block.items, checked, (item) => packingItemKey(item), y);
        }
      }

      if (day.activities.length > 0) {
        y = writeLines(pdf, "Activities", MARGIN + 2, y, CONTENT_W);
        y += 1;
        for (const block of day.activities) {
          y = writeLines(pdf, block.name, MARGIN + 4, y, CONTENT_W);
          y = writeChecklist(pdf, block.items, checked, (item) => packingItemKey(item), y);
        }
      }

      y += 2;
    }
  }

  if (doc.combinedItems.length > 0) {
    y = writeHeading(pdf, "Combined checklist", y, 13);
    y = writeLines(
      pdf,
      "Everything to pack once — duplicates across days merged.",
      MARGIN,
      y,
      CONTENT_W
    );
    y += 1;
    y = writeChecklist(pdf, doc.combinedItems, checked, (item) => packingItemKey(item), y);
  }

  y = writeHeading(pdf, "General essentials", y, 13);
  y = writeLines(
    pdf,
    "Handy extras for a Bali trip — add or remove as you like.",
    MARGIN,
    y,
    CONTENT_W
  );
  y += 1;
  y = writeChecklist(pdf, doc.essentials, checked, (_, i) => essentialItemKey(i), y);

  pdf.save(packingListFilename(doc.profileName));
}
