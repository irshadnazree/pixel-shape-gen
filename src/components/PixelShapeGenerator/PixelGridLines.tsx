import React from "react";
import { MIN_ZOOM_FOR_PIXEL_GRID } from "../../constants/pixel-shape";

interface PixelGridLinesProps {
  zoom: number;
  canvasOffset: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  minZoomThreshold?: number;
}

export const PixelGridLines = React.memo<PixelGridLinesProps>(
  ({
    zoom,
    canvasOffset,
    viewportWidth,
    viewportHeight,
    minZoomThreshold = MIN_ZOOM_FOR_PIXEL_GRID,
  }) => {
    if (
      !viewportWidth ||
      !viewportHeight ||
      zoom <= 0 ||
      zoom < minZoomThreshold
    ) {
      return null;
    }

    const worldViewLeft = -canvasOffset.x / zoom;
    const worldViewTop = -canvasOffset.y / zoom;
    const worldViewRight = (viewportWidth - canvasOffset.x) / zoom;
    const worldViewBottom = (viewportHeight - canvasOffset.y) / zoom;

    const gridColor = "rgba(150, 150, 150, 0.4)";
    const gridLineWidth = 1;
    const lines = [];

    // Vertical lines
    const firstVerticalLineX = Math.floor(worldViewLeft);
    for (let x = firstVerticalLineX; x < worldViewRight; x++) {
      lines.push(
        <div
          key={`v-pixel-${x}`}
          style={{
            position: "absolute",
            left: `${x * zoom}px`,
            top: `${worldViewTop * zoom}px`,
            width: `${gridLineWidth}px`,
            height: `${(worldViewBottom - worldViewTop) * zoom}px`,
            backgroundColor: gridColor,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      );
    }

    // Horizontal lines
    const firstHorizontalLineY = Math.floor(worldViewTop);
    for (let y = firstHorizontalLineY; y < worldViewBottom; y++) {
      lines.push(
        <div
          key={`h-pixel-${y}`}
          style={{
            position: "absolute",
            top: `${y * zoom}px`,
            left: `${worldViewLeft * zoom}px`,
            height: `${gridLineWidth}px`,
            width: `${(worldViewRight - worldViewLeft) * zoom}px`,
            backgroundColor: gridColor,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      );
    }

    return <>{lines}</>;
  }
);

PixelGridLines.displayName = "PixelGridLines";
