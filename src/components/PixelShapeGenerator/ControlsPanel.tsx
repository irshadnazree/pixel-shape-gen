import React from "react";
import type { ShapeData, ShapeType } from "../../constants/pixel-shape";
import { SHAPE_TYPES } from "../../constants/pixel-shape";
import { useTheme } from "../../contexts/ThemeContext";

interface ControlsPanelProps {
  // Form state
  currentShapeType: ShapeType;
  width: number;
  height: number;
  currentShapeBaseColor: string;
  currentShapeOpacity: number;
  isEditing: boolean;
  selectedShapeObject: ShapeData | undefined;

  // Form handlers
  onShapeTypeChange: (type: ShapeType) => void;
  onWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormSubmit: () => void;
}

export const ControlsPanel = React.memo<ControlsPanelProps>(
  ({
    currentShapeType,
    width,
    height,
    currentShapeBaseColor,
    currentShapeOpacity,
    isEditing,
    selectedShapeObject,
    onShapeTypeChange,
    onWidthChange,
    onHeightChange,
    onColorChange,
    onOpacityChange,
    onFormSubmit,
  }) => {
    const { isDarkMode } = useTheme();

    const inputClasses = `
      w-full px-3 py-2 border rounded-md shadow-sm transition-colors
      focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
      ${
        isDarkMode
          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900"
      }
    `;

    const labelClasses = `
      block text-sm font-medium mb-2
      ${isDarkMode ? "text-gray-200" : "text-gray-700"}
    `;

    const buttonClasses = `
      w-full font-bold py-3 px-4 rounded-md transition-colors duration-150
      ${
        isDarkMode
          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }
    `;

    return (
      <div className="space-y-6">
        <div>
          <label className={labelClasses}>Shape Type:</label>
          <div className="flex flex-col space-y-2">
            {SHAPE_TYPES.map((type) => (
              <label
                key={type}
                className={`
                  flex items-center space-x-2 cursor-pointer p-2 rounded-md transition-colors
                  ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                `}
              >
                <input
                  type="radio"
                  name="shapeType"
                  value={type}
                  checked={currentShapeType === type}
                  onChange={() => onShapeTypeChange(type)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  disabled={isEditing && selectedShapeObject?.type !== type}
                />
                <span
                  className={`text-sm capitalize ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Width (pixels):</label>
            <input
              type="number"
              value={width}
              onChange={onWidthChange}
              className={inputClasses}
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className={labelClasses}>Height (pixels):</label>
            <input
              type="number"
              value={height}
              onChange={onHeightChange}
              className={inputClasses}
              min="1"
              max="100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="shapeColor" className={labelClasses}>
            Shape Color:
          </label>
          <input
            id="shapeColor"
            type="color"
            value={currentShapeBaseColor}
            onChange={onColorChange}
            className={`
              w-full h-10 border rounded-md cursor-pointer
              ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}
            `}
          />
        </div>

        <div>
          <label htmlFor="shapeOpacity" className={labelClasses}>
            Opacity: {currentShapeOpacity.toFixed(2)}
          </label>
          <input
            id="shapeOpacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentShapeOpacity}
            onChange={onOpacityChange}
            className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600
              ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}
            `}
          />
        </div>

        <button onClick={onFormSubmit} className={buttonClasses}>
          {isEditing
            ? `Update ${selectedShapeObject?.type || "Shape"}`
            : `Add ${currentShapeType}`}
        </button>
      </div>
    );
  }
);
