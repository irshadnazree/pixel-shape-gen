import React from "react";
import type { ShapeData, SnappingGuide } from "../../constants/pixel-shape";
import { useViewportSize } from "../../hooks/pixel-shape";
import { PixelGridLines } from "./PixelGridLines";
import { PixelShapeDisplay } from "./PixelShapeDisplay";

interface CanvasAreaProps {
  viewportContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  canvasOffset: { x: number; y: number };
  shapes: ShapeData[];
  selectedShapeId: number | null;
  snappingGuides: SnappingGuide[];
  isDraggingShape: boolean;
  isPanning: boolean;
  onPointerDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onResetView: () => void;
}

export const CanvasArea = React.memo<CanvasAreaProps>(
  ({
    viewportContainerRef,
    zoom,
    canvasOffset,
    shapes,
    selectedShapeId,
    snappingGuides,
    isDraggingShape,
    isPanning,
    onPointerDown,
    onWheel,
    onResetView,
  }) => {
    const viewportSize = useViewportSize(viewportContainerRef);

    const getCursor = () => {
      if (isPanning) return "grabbing";
      if (isDraggingShape) return "move";
      return "grab";
    };

    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
            Canvas
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-sm text-gray-600">
              Zoom: {zoom.toFixed(2)}x
            </div>
            <button
              onClick={onResetView}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition duration-150"
            >
              Reset View
            </button>
          </div>
        </div>

        <div
          ref={viewportContainerRef}
          className="border border-gray-300 rounded-md mb-4 relative overflow-hidden bg-gray-50 cursor-grab touch-none select-none"
          style={{
            height: "400px",
            cursor: getCursor(),
          }}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          onWheel={onWheel}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="absolute w-full h-full"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
              userSelect: "none",
            }}
          >
            <PixelGridLines
              zoom={zoom}
              canvasOffset={canvasOffset}
              viewportWidth={viewportSize.width}
              viewportHeight={viewportSize.height}
            />

            {shapes.map((shape) => (
              <PixelShapeDisplay
                key={shape.id}
                shapeData={shape}
                zoom={zoom}
                isSelected={selectedShapeId === shape.id}
              />
            ))}

            {snappingGuides.map((guide) => (
              <div
                key={guide.id}
                className="absolute bg-red-500 opacity-75"
                style={{
                  ...(guide.type === "V"
                    ? {
                        left: `${guide.x! * zoom}px`,
                        top: `${guide.startY! * zoom}px`,
                        width: "1px",
                        height: `${(guide.endY! - guide.startY!) * zoom}px`,
                      }
                    : {
                        left: `${guide.startX! * zoom}px`,
                        top: `${guide.y! * zoom}px`,
                        width: `${(guide.endX! - guide.startX!) * zoom}px`,
                        height: "1px",
                      }),
                  zIndex: 20,
                }}
              />
            ))}

            {shapes.length === 0 && !isPanning && !isDraggingShape && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic pointer-events-none">
                Click "Add Shape" to create your first shape!
              </div>
            )}
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 p-1 rounded pointer-events-none">
            Click: Select | Drag: Move/Pan | Double-click: Zoom | Wheel/Pinch:
            Zoom
          </div>
        </div>
      </div>
    );
  }
);
