// Conversion utilities from original badge generator

export const mmToPx = (mm: number, dpi: number = 300): number => {
  return Math.round((mm * dpi) / 25.4);
};

export const pxToMm = (px: number, dpi: number = 300): number => {
  return (px * 25.4) / dpi;
};