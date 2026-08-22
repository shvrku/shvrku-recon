/** Matches haoqi.design: cells grow with the viewport, not a fixed table. */

export const GRID_GAP = 12;
export const GRID_PLUS = 6;
export const GRID_LG = 1024;
export const CELL_INSET = 16;
export const CELL_INSET_LG = 20;

export function getGridPadX(width: number) {
  return width >= GRID_LG ? 56 : 16;
}

export function getGridCols(width: number) {
  return width >= GRID_LG ? 3 : 2;
}

export function getGridXs(width: number) {
  const cols = getGridCols(width);
  const pad = getGridPadX(width);
  const inner = width - pad * 2;
  return Array.from({ length: cols + 1 }, (_, i) => pad + (inner * i) / cols);
}

export function getGridYs(height: number) {
  return [height / 3, (height * 2) / 3 + GRID_GAP];
}
