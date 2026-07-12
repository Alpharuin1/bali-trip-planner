import type { FileAttachment } from "../types";

/** Keep attachments small enough for JSON cloud sync. */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export const PDF_ATTACHMENT_ACCEPT = ".pdf,application/pdf";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file."));
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

export async function fileToAttachment(file: File): Promise<FileAttachment> {
  if (!isPdfFile(file)) {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `PDF is too large (${formatFileSize(file.size)}). Max ${formatFileSize(MAX_ATTACHMENT_BYTES)}.`
    );
  }

  const dataUrl = await readFileAsDataUrl(file);
  return {
    name: file.name,
    mimeType: "application/pdf",
    dataUrl,
  };
}

export function downloadAttachment(attachment: FileAttachment): void {
  const link = document.createElement("a");
  link.href = attachment.dataUrl;
  link.download = attachment.name;
  link.rel = "noopener noreferrer";
  link.click();
}
