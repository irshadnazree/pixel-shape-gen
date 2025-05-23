// Constants for Pixel Shape Generator
export const SNAP_THRESHOLD_SCREEN = 4;
export const MIN_ZOOM_FOR_PIXEL_GRID = 4;
export const SHAPE_TYPES = ["ellipse", "crescent", "box"] as const;
export const ZOOM_FACTOR = 1.1;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 100;
export const DOUBLE_CLICK_DELAY = 300;
export const DRAG_THRESHOLD = 5; // pixels

export type ShapeType = typeof SHAPE_TYPES[number];

export interface ShapeData {
  id: number;
  type: ShapeType;
  width: number;
  height: number;
  baseColor: string;
  opacity: number;
  position: { x: number; y: number };
}

export interface SnappingGuide {
  id: string;
  type: "V" | "H";
  x?: number;
  y?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
} 