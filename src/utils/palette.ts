// Distinct, soft hues used to tag templates so each plan is visually distinct
// in compare mode and on the map markers.
export const TEMPLATE_PALETTE = [
  "#6f42c1", // purple (default)
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#8b5cf6", // violet
];

export const colorForTemplate = (
  templateName: string,
  order: string[]
): string => {
  const i = order.indexOf(templateName);
  const idx = i < 0 ? 0 : i;
  return TEMPLATE_PALETTE[idx % TEMPLATE_PALETTE.length];
};
