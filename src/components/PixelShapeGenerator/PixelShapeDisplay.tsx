import React, { useMemo } from "react";
import type { ShapeData } from "../../constants/pixel-shape";
import {
  createShapeMask,
  darkenColor,
  isOutlinePixel,
} from "../../utils/pixel-shape";

interface PixelShapeDisplayProps {
  shapeData: ShapeData;
  zoom: number;
  isSelected: boolean;
}

// Generate pixel divs for a shape
const generatePixelDivs = (shapeData: ShapeData, zoom: number) => {
  const { type, width, height, baseColor, opacity, position } = shapeData;
  const mask = createShapeMask(type, width, height);
  const pixels = [];
  const outlineColor = darkenColor(baseColor, 0.3, opacity);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y][x]) continue;

      const isOutline = isOutlinePixel(x, y, mask, type, width, height);
      const displayColor = isOutline ? outlineColor : "transparent";

      pixels.push(
        <div
          key={`${type}-${x}-${y}`}
          style={{
            position: "absolute",
            left: (position.x + x) * zoom,
            top: (position.y + y) * zoom,
            width: zoom,
            height: zoom,
            backgroundColor: displayColor,
            boxSizing: "border-box",
          }}
        />
      );
    }
  }

  return pixels;
};

export const PixelShapeDisplay = React.memo<PixelShapeDisplayProps>(
  ({ shapeData, zoom, isSelected }) => {
    const pixelElements = useMemo(
      () => generatePixelDivs(shapeData, zoom),
      [shapeData, zoom]
    );

    return (
      <div
        className={`${
          isSelected ? "ring-2 ring-indigo-500 z-10" : ""
        } pointer-events-none`}
      >
        {pixelElements}
      </div>
    );
  }
);

PixelShapeDisplay.displayName = "PixelShapeDisplay";
