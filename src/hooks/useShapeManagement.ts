import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ShapeData, ShapeType } from '../constants/pixel-shape';

export const useShapeManagement = () => {
  // Shape data
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);

  // Form state
  const [currentShapeType, setCurrentShapeType] =
    useState<ShapeType>('ellipse');
  const [width, setWidth] = useState<number | null>(10);
  const [height, setHeight] = useState<number | null>(10);
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      if (value === '') {
        setWidth(null);
      } else {
        const numValue = parseInt(value);
        setWidth(isNaN(numValue) ? null : numValue);
      }
    },
    []
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      if (value === '') {
        setHeight(null);
      } else {
        const numValue = parseInt(value);
        setHeight(isNaN(numValue) ? null : numValue);
      }
    },
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

  // Validation helper
  const validateDimensions = useCallback(() => {
    const errors: string[] = [];

    if (width === null || width <= 0) {
      errors.push('Width must be a positive number');
    }

    if (height === null || height <= 0) {
      errors.push('Height must be a positive number');
    }

    return errors;
  }, [width, height]);

  // Shape operations - these will be called with position from canvas interaction
  const addShape = useCallback(
    (position: { x: number; y: number }) => {
      const validationErrors = validateDimensions();

      if (validationErrors.length > 0) {
        alert(`Cannot add shape:\n${validationErrors.join('\n')}`);
        return;
      }

      const newShapeId = Date.now();
      const newShape: ShapeData = {
        id: newShapeId,
        type: currentShapeType,
        width: width!,
        height: height!,
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
      validateDimensions,
    ]
  );

  const updateSelectedShape = useCallback(() => {
    if (!selectedShapeId) return;

    const validationErrors = validateDimensions();

    if (validationErrors.length > 0) {
      alert(`Cannot update shape:\n${validationErrors.join('\n')}`);
      return;
    }

    setShapes((prevShapes) =>
      prevShapes.map((s) =>
        s.id === selectedShapeId
          ? {
              ...s,
              width: width!,
              height: height!,
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
    validateDimensions,
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
