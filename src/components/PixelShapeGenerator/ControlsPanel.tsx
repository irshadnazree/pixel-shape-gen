import React from "react";
import type { ShapeData, ShapeType } from "../../constants/pixel-shape";
import { SHAPE_TYPES } from "../../constants/pixel-shape";

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
    return (
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape Type:
          </label>
          <div className="flex items-center space-x-4">
            {SHAPE_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 cursor-pointer"
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
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (pixels):
            </label>
            <input
              type="number"
              value={width}
              onChange={onWidthChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (pixels):
            </label>
            <input
              type="number"
              value={height}
              onChange={onHeightChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="shapeColor"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Shape Color:
          </label>
          <input
            id="shapeColor"
            type="color"
            value={currentShapeBaseColor}
            onChange={onColorChange}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="shapeOpacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <button
          onClick={onFormSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out"
        >
          {isEditing
            ? `Update ${selectedShapeObject?.type || "Shape"}`
            : `Add ${currentShapeType}`}
        </button>
      </div>
    );
  }
);
