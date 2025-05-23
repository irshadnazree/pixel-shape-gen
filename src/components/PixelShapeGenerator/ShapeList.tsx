import React from "react";
import type { ShapeData } from "../../constants/pixel-shape";
import { darkenColor } from "../../utils/pixel-shape";

interface ShapeListProps {
  shapes: ShapeData[];
  selectedShapeId: number | null;
  onShapeSelect: (id: number) => void;
  onRemoveShape: (id: number) => void;
  onMoveShapeLayer: (id: number, direction: string) => void;
}

export const ShapeList = React.memo<ShapeListProps>(
  ({
    shapes,
    selectedShapeId,
    onShapeSelect,
    onRemoveShape,
    onMoveShapeLayer,
  }) => {
    if (shapes.length === 0) {
      return (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Shape List
          </h3>
          <p className="text-sm text-gray-500 italic">
            No shapes on the canvas yet.
          </p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Shape List</h3>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
          {shapes.map((shape, index) => {
            const isFirst = index === 0;
            const isLast = index === shapes.length - 1;
            const isSelected = selectedShapeId === shape.id;

            return (
              <div
                key={shape.id}
                className={`p-3 border border-gray-200 rounded-md flex flex-col sm:flex-row justify-between items-center transition-colors duration-150 ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className="flex items-center space-x-3 mb-2 sm:mb-0 cursor-pointer flex-grow"
                  onClick={() => onShapeSelect(shape.id)}
                >
                  <span className="font-medium text-sm text-gray-600">
                    #{shapes.length - index}:
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {shape.type} ({shape.width}×{shape.height}px, Op:{" "}
                    {shape.opacity.toFixed(2)})
                  </span>
                  <div className="flex items-center">
                    <div
                      title={`Base Color: ${shape.baseColor}`}
                      className="inline-block w-3 h-3 border border-gray-400 rounded-sm"
                      style={{ backgroundColor: shape.baseColor }}
                    />
                    <div
                      title={`Outline Color: ${darkenColor(
                        shape.baseColor,
                        0.3,
                        shape.opacity
                      )}`}
                      className="inline-block w-3 h-3 border border-gray-400 rounded-sm ml-1"
                      style={{
                        backgroundColor: darkenColor(
                          shape.baseColor,
                          0.3,
                          shape.opacity
                        ),
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    title="Bring to Front"
                    onClick={() => onMoveShapeLayer(shape.id, "toFront")}
                    disabled={isLast}
                    className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑↑
                  </button>
                  <button
                    title="Move Forward"
                    onClick={() => onMoveShapeLayer(shape.id, "forward")}
                    disabled={isLast}
                    className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    title="Move Backward"
                    onClick={() => onMoveShapeLayer(shape.id, "backward")}
                    disabled={isFirst}
                    className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    title="Send to Back"
                    onClick={() => onMoveShapeLayer(shape.id, "toBack")}
                    disabled={isFirst}
                    className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveShape(shape.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
