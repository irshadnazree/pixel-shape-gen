import React from "react";
import type { ShapeData } from "../../constants/pixel-shape";
import { useTheme } from "../../contexts/ThemeContext";
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
    const { isDarkMode } = useTheme();

    if (shapes.length === 0) {
      return (
        <div>
          <p
            className={`text-sm italic ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No shapes on the canvas yet.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {shapes.map((shape, index) => {
            const isFirst = index === 0;
            const isLast = index === shapes.length - 1;
            const isSelected = selectedShapeId === shape.id;

            return (
              <div
                key={shape.id}
                className={`
                  p-3 border rounded-md flex flex-col justify-between transition-colors duration-150
                  ${
                    isSelected
                      ? isDarkMode
                        ? "bg-indigo-900 border-indigo-600"
                        : "bg-indigo-50 border-indigo-300"
                      : isDarkMode
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
                <div
                  className="flex items-center space-x-3 mb-3 cursor-pointer"
                  onClick={() => onShapeSelect(shape.id)}
                >
                  <span
                    className={`font-medium text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    #{shapes.length - index}:
                  </span>
                  <span
                    className={`text-xs capitalize flex-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      title="Bring to Front"
                      onClick={() => onMoveShapeLayer(shape.id, "toFront")}
                      disabled={isLast}
                      className={`
                        px-2 py-1 text-xs rounded transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }
                      `}
                    >
                      ↑↑
                    </button>
                    <button
                      title="Move Forward"
                      onClick={() => onMoveShapeLayer(shape.id, "forward")}
                      disabled={isLast}
                      className={`
                        px-2 py-1 text-xs rounded transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }
                      `}
                    >
                      ↑
                    </button>
                    <button
                      title="Move Backward"
                      onClick={() => onMoveShapeLayer(shape.id, "backward")}
                      disabled={isFirst}
                      className={`
                        px-2 py-1 text-xs rounded transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }
                      `}
                    >
                      ↓
                    </button>
                    <button
                      title="Send to Back"
                      onClick={() => onMoveShapeLayer(shape.id, "toBack")}
                      disabled={isFirst}
                      className={`
                        px-2 py-1 text-xs rounded transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }
                      `}
                    >
                      ↓↓
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveShape(shape.id);
                    }}
                    className={`
                      text-xs font-semibold px-2 py-1 rounded transition-colors
                      ${
                        isDarkMode
                          ? "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          : "text-red-500 hover:text-red-700 hover:bg-red-100"
                      }
                    `}
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
