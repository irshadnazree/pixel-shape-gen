import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ShapeData, ShapeType } from '../constants/pixel-shape';

export const useShapeManagement = () => {
  // Shape data
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);

  // Form state
  const [currentShapeType, setCurrentShapeType] =
    useState<ShapeType>('ellipse');
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [currentShapeBaseColor, setCurrentShapeBaseColor] = useState('#007BFF');
  const [currentShapeOpacity, setCurrentShapeOpacity] = useState(1);

  // Computed values
  const selectedShapeObject = useMemo(
    () => shapes.find((s) => s.id === selectedShapeId),
    [shapes, selectedShapeId]
  );
  const isEditing = selectedShapeId !== null;

  // Reset form to default values
  const resetFormToDefaults = useCallback(() => {
    setSelectedShapeId(null);
    setCurrentShapeType('ellipse');
    setWidth(10);
    setHeight(10);
    setCurrentShapeBaseColor('#007BFF');
    setCurrentShapeOpacity(1);
  }, []);

  // Sync form with selected shape
  useEffect(() => {
    if (selectedShapeObject) {
      setWidth(selectedShapeObject.width);
      setHeight(selectedShapeObject.height);
      setCurrentShapeBaseColor(selectedShapeObject.baseColor);
      setCurrentShapeOpacity(selectedShapeObject.opacity);
      setCurrentShapeType(selectedShapeObject.type);
    }
  }, [selectedShapeObject]);

  // Form change handlers
  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setWidth(Math.max(1, parseInt(e.target.value) || 1)),
    []
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setHeight(Math.max(1, parseInt(e.target.value) || 1)),
    []
  );

  const handleOpacityChange = useCallback(
    (value: number[]) => setCurrentShapeOpacity(value[0]),
    []
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCurrentShapeBaseColor(e.target.value),
    []
  );

  const handleShapeTypeChange = useCallback(
    (type: ShapeType) => setCurrentShapeType(type),
    []
  );

  // Shape operations - these will be called with position from canvas interaction
  const addShape = useCallback(
    (position: { x: number; y: number }) => {
      const newShapeId = Date.now();
      const newShape: ShapeData = {
        id: newShapeId,
        type: currentShapeType,
        width,
        height,
        baseColor: currentShapeBaseColor,
        opacity: currentShapeOpacity,
        position: { x: Math.round(position.x), y: Math.round(position.y) },
      };

      setShapes((prev) => [...prev, newShape]);
      resetFormToDefaults();
    },
    [
      width,
      height,
      currentShapeBaseColor,
      currentShapeOpacity,
      currentShapeType,
      resetFormToDefaults,
    ]
  );

  const updateSelectedShape = useCallback(() => {
    if (!selectedShapeId) return;

    setShapes((prevShapes) =>
      prevShapes.map((s) =>
        s.id === selectedShapeId
          ? {
              ...s,
              width,
              height,
              baseColor: currentShapeBaseColor,
              opacity: currentShapeOpacity,
            }
          : s
      )
    );
    resetFormToDefaults();
  }, [
    selectedShapeId,
    width,
    height,
    currentShapeBaseColor,
    currentShapeOpacity,
    resetFormToDefaults,
  ]);

  const handleFormSubmit = useCallback(
    (getNewShapePosition: () => { x: number; y: number }) => {
      if (isEditing) {
        updateSelectedShape();
      } else {
        const position = getNewShapePosition();
        addShape(position);
      }
    },
    [isEditing, addShape, updateSelectedShape]
  );

  const removeShape = useCallback(
    (id: number) => {
      setShapes((prev) => prev.filter((s) => s.id !== id));
      if (selectedShapeId === id) {
        resetFormToDefaults();
      }
    },
    [selectedShapeId, resetFormToDefaults]
  );

  const moveShape = useCallback(
    (id: number, position: { x: number; y: number }) => {
      setShapes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, position } : s))
      );
    },
    []
  );

  const handleMoveShapeLayer = useCallback(
    (shapeId: number, direction: string) => {
      setShapes((prevShapes) => {
        const currentIndex = prevShapes.findIndex((s) => s.id === shapeId);
        if (currentIndex === -1) return prevShapes;

        const newShapes = [...prevShapes];
        const [shapeToMove] = newShapes.splice(currentIndex, 1);

        switch (direction) {
          case 'toFront':
            newShapes.push(shapeToMove);
            break;
          case 'toBack':
            newShapes.unshift(shapeToMove);
            break;
          case 'forward':
            newShapes.splice(
              Math.min(prevShapes.length - 1, currentIndex + 1),
              0,
              shapeToMove
            );
            break;
          case 'backward':
            newShapes.splice(Math.max(0, currentIndex - 1), 0, shapeToMove);
            break;
        }

        return newShapes;
      });
    },
    []
  );

  const reorderShapes = useCallback((fromIndex: number, toIndex: number) => {
    setShapes((prevShapes) => {
      const newShapes = [...prevShapes];
      const [movedShape] = newShapes.splice(fromIndex, 1);
      newShapes.splice(toIndex, 0, movedShape);
      return newShapes;
    });
  }, []);

  return {
    // Shape data
    shapes,
    selectedShapeId,
    selectedShapeObject,
    isEditing,

    // Form state
    currentShapeType,
    width,
    height,
    currentShapeBaseColor,
    currentShapeOpacity,

    // Form handlers
    handleWidthChange,
    handleHeightChange,
    handleOpacityChange,
    handleColorChange,
    handleShapeTypeChange,

    // Shape operations
    addShape,
    updateSelectedShape,
    handleFormSubmit,
    removeShape,
    moveShape,
    handleMoveShapeLayer,
    reorderShapes,

    // Selection
    setSelectedShapeId,
    resetFormToDefaults,
  };
};
