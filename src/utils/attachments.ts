import type { FileAttachment } from "../types";

/** Keep attachments small enough for JSON cloud sync. */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export const BOOKING_ATTACHMENT_ACCEPT =
  ".pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

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

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const lower = file.name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isSupportedBookingFile(file: File): boolean {
  return isPdfFile(file) || isImageFile(file);
}

export function isImageAttachment(attachment: FileAttachment): boolean {
  if (attachment.mimeType.startsWith("image/")) return true;
  const lower = attachment.name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function mimeTypeForFile(file: File): string {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

export async function fileToAttachment(file: File): Promise<FileAttachment> {
  if (!isSupportedBookingFile(file)) {
    throw new Error("Only PDF and image files are supported.");
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `File is too large (${formatFileSize(file.size)}). Max ${formatFileSize(MAX_ATTACHMENT_BYTES)}.`
    );
  }

  const dataUrl = await readFileAsDataUrl(file);
  return {
    name: file.name,
    mimeType: mimeTypeForFile(file),
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
