import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ShapeData,
  ShapeType,
  SnappingGuide,
} from "../../constants/pixel-shape";
import {
  DOUBLE_CLICK_DELAY,
  DRAG_THRESHOLD,
  MAX_ZOOM,
  MIN_ZOOM,
  SHAPE_TYPES,
  SNAP_THRESHOLD_SCREEN,
} from "../../constants/pixel-shape";
import { useShapeHitTest, useViewportSize } from "../../hooks/pixel-shape";
import {
  darkenColor,
  getTouchCenter,
  getTouchDistance,
} from "../../utils/pixel-shape";
import { PixelGridLines } from "./PixelGridLines";
import { PixelShapeDisplay } from "./PixelShapeDisplay";

export default function PixelShapeGenerator() {
  // State
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [currentShapeType, setCurrentShapeType] =
    useState<ShapeType>("ellipse");
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [currentShapeBaseColor, setCurrentShapeBaseColor] = useState("#007BFF");
  const [currentShapeOpacity, setCurrentShapeOpacity] = useState(1);
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [snappingGuides, setSnappingGuides] = useState<SnappingGuide[]>([]);

  // Google Maps-style interaction state
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [pointerStartPos, setPointerStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(10);
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });

  // Refs
  const viewportContainerRef = useRef<HTMLDivElement>(null);
  const dragShapeStartOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Custom hooks
  const viewportSize = useViewportSize(viewportContainerRef);
  const hitTest = useShapeHitTest(shapes);

  // Computed values
  const selectedShapeObject = useMemo(
    () => shapes.find((s) => s.id === selectedShapeId),
    [shapes, selectedShapeId]
  );
  const isEditing = selectedShapeId !== null;

  // Reset form to default values
  const resetFormToDefaults = useCallback(() => {
    setSelectedShapeId(null);
    setCurrentShapeType("ellipse");
    setWidth(10);
    setHeight(10);
    setCurrentShapeBaseColor("#007BFF");
    setCurrentShapeOpacity(1);
    setIsDraggingShape(false);
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

  // Event handlers
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
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCurrentShapeOpacity(parseFloat(e.target.value)),
    []
  );

  const addShape = useCallback(() => {
    let initialX = 50;
    let initialY = 50;

    if (viewportContainerRef.current) {
      const { width: cw, height: ch } =
        viewportContainerRef.current.getBoundingClientRect();
      initialX = (cw / 2 - canvasOffset.x) / zoom - width / 2;
      initialY = (ch / 2 - canvasOffset.y) / zoom - height / 2;
    }

    const newShapeId = Date.now();
    const newShape: ShapeData = {
      id: newShapeId,
      type: currentShapeType,
      width,
      height,
      baseColor: currentShapeBaseColor,
      opacity: currentShapeOpacity,
      position: { x: Math.round(initialX), y: Math.round(initialY) },
    };

    setShapes((prev) => [...prev, newShape]);
    resetFormToDefaults();
  }, [
    width,
    height,
    currentShapeBaseColor,
    currentShapeOpacity,
    canvasOffset,
    zoom,
    currentShapeType,
    resetFormToDefaults,
  ]);

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

  const handleFormSubmit = useCallback(() => {
    if (isEditing) {
      updateSelectedShape();
    } else {
      addShape();
    }
  }, [isEditing, addShape, updateSelectedShape]);

  const removeShape = useCallback(
    (id: number) => {
      setShapes((prev) => prev.filter((s) => s.id !== id));
      if (selectedShapeId === id) {
        resetFormToDefaults();
      }
    },
    [selectedShapeId, resetFormToDefaults]
  );

  const resetView = useCallback(() => {
    setZoom(10);
    setCanvasOffset({ x: 0, y: 0 });
    setIsPanning(false);
    setIsDraggingShape(false);
    setSnappingGuides([]);
    setIsPointerDown(false);
    setHasMoved(false);
    resetFormToDefaults();
  }, [resetFormToDefaults]);

  const handleMoveShapeLayer = useCallback(
    (shapeId: number, direction: string) => {
      setShapes((prevShapes) => {
        const currentIndex = prevShapes.findIndex((s) => s.id === shapeId);
        if (currentIndex === -1) return prevShapes;

        const newShapes = [...prevShapes];
        const [shapeToMove] = newShapes.splice(currentIndex, 1);

        switch (direction) {
          case "toFront":
            newShapes.push(shapeToMove);
            break;
          case "toBack":
            newShapes.unshift(shapeToMove);
            break;
          case "forward":
            newShapes.splice(
              Math.min(prevShapes.length - 1, currentIndex + 1),
              0,
              shapeToMove
            );
            break;
          case "backward":
            newShapes.splice(Math.max(0, currentIndex - 1), 0, shapeToMove);
            break;
        }

        return newShapes;
      });
    },
    []
  );

  // Google Maps-style pointer down handler
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!viewportContainerRef.current) return;

      e.preventDefault();

      const currentTime = Date.now();
      const isDoubleClick = currentTime - lastClickTime < DOUBLE_CLICK_DELAY;
      setLastClickTime(currentTime);

      // Handle touch events
      if ("touches" in e) {
        const touchCenter = getTouchCenter(e.touches);
        setPointerStartPos({ x: touchCenter.x, y: touchCenter.y });

        if (e.touches.length === 2) {
          // Two-finger touch - prepare for pinch zoom
          const distance = getTouchDistance(e.touches);
          setLastTouchDistance(distance);
          setInitialZoom(zoom);
          setInitialOffset(canvasOffset);
          setIsPanning(true);
          setIsPointerDown(true);
          setHasMoved(false);
          return;
        }
      } else {
        // Mouse events
        setPointerStartPos({ x: e.clientX, y: e.clientY });
      }

      setIsPointerDown(true);
      setHasMoved(false);

      // Double-click to zoom
      if (isDoubleClick && !("touches" in e)) {
        const { left, top } =
          viewportContainerRef.current.getBoundingClientRect();
        const centerX = e.clientX - left;
        const centerY = e.clientY - top;

        const newZoom = Math.min(MAX_ZOOM, zoom * 2);
        const worldX = (centerX - canvasOffset.x) / zoom;
        const worldY = (centerY - canvasOffset.y) / zoom;

        setCanvasOffset({
          x: centerX - worldX * newZoom,
          y: centerY - worldY * newZoom,
        });
        setZoom(newZoom);
        return;
      }

      // Single click/touch - check for shape hit
      const { left, top } =
        viewportContainerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const mouseXWorld = (clientX - left - canvasOffset.x) / zoom;
      const mouseYWorld = (clientY - top - canvasOffset.y) / zoom;

      const hitShape = hitTest(mouseXWorld, mouseYWorld);

      if (hitShape) {
        setSelectedShapeId(hitShape.id);
        dragShapeStartOffsetRef.current = {
          x: mouseXWorld - hitShape.position.x,
          y: mouseYWorld - hitShape.position.y,
        };
      } else {
        // Prepare for panning
        setIsPanning(true);
        panStartRef.current = { x: clientX, y: clientY };
      }
    },
    [canvasOffset, zoom, hitTest, lastClickTime]
  );

  // Google Maps-style pointer move handler
  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isPointerDown || !viewportContainerRef.current) return;

      e.preventDefault();

      let clientX: number, clientY: number;

      // Handle touch events
      if ("touches" in e) {
        if (e.touches.length === 2) {
          // Two-finger pinch zoom
          const touchCenter = getTouchCenter(e.touches);
          const currentDistance = getTouchDistance(e.touches);

          if (lastTouchDistance > 0) {
            const zoomDelta = currentDistance / lastTouchDistance;
            const newZoom = Math.max(
              MIN_ZOOM,
              Math.min(MAX_ZOOM, initialZoom * zoomDelta)
            );

            const { left, top } =
              viewportContainerRef.current.getBoundingClientRect();
            const centerX = touchCenter.x - left;
            const centerY = touchCenter.y - top;

            const worldX = (centerX - initialOffset.x) / initialZoom;
            const worldY = (centerY - initialOffset.y) / initialZoom;

            setCanvasOffset({
              x: centerX - worldX * newZoom,
              y: centerY - worldY * newZoom,
            });
            setZoom(newZoom);
          }

          setHasMoved(true);
          return;
        } else {
          const touchCenter = getTouchCenter(e.touches);
          clientX = touchCenter.x;
          clientY = touchCenter.y;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const deltaX = clientX - pointerStartPos.x;
      const deltaY = clientY - pointerStartPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > DRAG_THRESHOLD) {
        setHasMoved(true);
      }

      if (selectedShapeId && !isPanning) {
        // Shape dragging
        if (distance > DRAG_THRESHOLD) {
          setIsDraggingShape(true);

          const currentMovingShape = shapes.find(
            (s) => s.id === selectedShapeId
          );
          if (!currentMovingShape) return;

          const { left, top } =
            viewportContainerRef.current.getBoundingClientRect();
          const mouseXWorld = (clientX - left - canvasOffset.x) / zoom;
          const mouseYWorld = (clientY - top - canvasOffset.y) / zoom;

          let tentativePos = {
            x: mouseXWorld - dragShapeStartOffsetRef.current.x,
            y: mouseYWorld - dragShapeStartOffsetRef.current.y,
          };

          // Snapping logic
          const activeGuides: SnappingGuide[] = [];
          const snapThresholdWorld = SNAP_THRESHOLD_SCREEN / zoom;
          let currentDraggedCenterX =
            tentativePos.x + currentMovingShape.width / 2;
          let currentDraggedCenterY =
            tentativePos.y + currentMovingShape.height / 2;

          shapes.forEach((otherShape) => {
            if (otherShape.id === selectedShapeId) return;

            const otherCenterX = otherShape.position.x + otherShape.width / 2;
            const otherCenterY = otherShape.position.y + otherShape.height / 2;

            // Vertical snapping
            if (
              Math.abs(currentDraggedCenterX - otherCenterX) <
              snapThresholdWorld
            ) {
              tentativePos.x = otherCenterX - currentMovingShape.width / 2;
              currentDraggedCenterX =
                tentativePos.x + currentMovingShape.width / 2;
              activeGuides.push({
                id: `v-${otherShape.id}`,
                type: "V",
                x: otherCenterX,
                startY: Math.min(tentativePos.y, otherShape.position.y),
                endY: Math.max(
                  tentativePos.y + currentMovingShape.height,
                  otherShape.position.y + otherShape.height
                ),
              });
            }

            // Horizontal snapping
            currentDraggedCenterY =
              tentativePos.y + currentMovingShape.height / 2;
            if (
              Math.abs(currentDraggedCenterY - otherCenterY) <
              snapThresholdWorld
            ) {
              tentativePos.y = otherCenterY - currentMovingShape.height / 2;
              activeGuides.push({
                id: `h-${otherShape.id}`,
                type: "H",
                y: otherCenterY,
                startX: Math.min(tentativePos.x, otherShape.position.x),
                endX: Math.max(
                  tentativePos.x + currentMovingShape.width,
                  otherShape.position.x + otherShape.width
                ),
              });
            }
          });

          setSnappingGuides(activeGuides);

          const finalPos = {
            x: Math.round(tentativePos.x),
            y: Math.round(tentativePos.y),
          };

          setShapes((prev) =>
            prev.map((s) =>
              s.id === selectedShapeId ? { ...s, position: finalPos } : s
            )
          );
        }
      } else if (isPanning && hasMoved) {
        // Canvas panning
        const dx = clientX - panStartRef.current.x;
        const dy = clientY - panStartRef.current.y;
        setCanvasOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        panStartRef.current = { x: clientX, y: clientY };
      }
    },
    [
      isPointerDown,
      selectedShapeId,
      isPanning,
      pointerStartPos,
      canvasOffset,
      zoom,
      shapes,
      hasMoved,
      lastTouchDistance,
      initialZoom,
      initialOffset,
    ]
  );

  // Google Maps-style pointer up handler
  const handlePointerUp = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!hasMoved && !isDraggingShape && !isPanning && selectedShapeId) {
        // Single click on shape without dragging - keep it selected
        // This allows for easy editing
      } else if (!hasMoved && !selectedShapeId) {
        // Single click on empty canvas - deselect
        resetFormToDefaults();
      }

      setIsPointerDown(false);
      setIsPanning(false);
      setIsDraggingShape(false);
      setSnappingGuides([]);
      setHasMoved(false);
      setLastTouchDistance(0);
    },
    [hasMoved, isDraggingShape, isPanning, selectedShapeId, resetFormToDefaults]
  );

  // Wheel zoom handler (same as before but with Google Maps feel)
  const handleWheelZoom = useCallback(
    (e: React.WheelEvent) => {
      if (!viewportContainerRef.current) return;

      e.preventDefault();

      let delta: number;
      if (e.ctrlKey) {
        // Pinch gesture on trackpad
        delta = -e.deltaY * 0.01;
      } else {
        // Regular scroll
        delta = e.deltaY < 0 ? 0.1 : -0.1;
      }

      const zoomFactor = 1 + delta;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));

      const { left, top } =
        viewportContainerRef.current.getBoundingClientRect();
      const mX = e.clientX - left;
      const mY = e.clientY - top;
      const wXBefore = (mX - canvasOffset.x) / zoom;
      const wYBefore = (mY - canvasOffset.y) / zoom;

      setCanvasOffset({
        x: mX - wXBefore * newZoom,
        y: mY - wYBefore * newZoom,
      });
      setZoom(newZoom);
    },
    [zoom, canvasOffset]
  );

  // Event listeners
  useEffect(() => {
    if (isPointerDown) {
      const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
      const handleMouseUp = (e: MouseEvent) => handlePointerUp(e);
      const handleTouchMove = (e: TouchEvent) => handlePointerMove(e);
      const handleTouchEnd = (e: TouchEvent) => handlePointerUp(e);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isPointerDown, handlePointerMove, handlePointerUp]);

  return (
    <div className="flex flex-col items-center w-full p-4 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        Pixel Art Shape Tool
      </h1>

      {/* Controls Panel */}
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
                  onChange={() => setCurrentShapeType(type)}
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
              onChange={handleWidthChange}
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
              onChange={handleHeightChange}
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
            onChange={(e) => setCurrentShapeBaseColor(e.target.value)}
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
            onChange={handleOpacityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <button
          onClick={handleFormSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out"
        >
          {isEditing
            ? `Update ${selectedShapeObject?.type || "Shape"}`
            : `Add ${currentShapeType}`}
        </button>
      </div>

      {/* Canvas Area */}
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
              onClick={resetView}
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
            cursor: isPanning ? "grabbing" : isDraggingShape ? "move" : "grab",
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onWheel={handleWheelZoom}
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

        {/* Shape List */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Shape List
          </h3>
          {shapes.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No shapes on the canvas yet.
            </p>
          )}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
            {shapes.map((shape, index) => {
              const isFirst = index === 0;
              const isLast = index === shapes.length - 1;
              return (
                <div
                  key={shape.id}
                  className={`p-3 border border-gray-200 rounded-md flex flex-col sm:flex-row justify-between items-center transition-colors duration-150 ${
                    selectedShapeId === shape.id
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="flex items-center space-x-3 mb-2 sm:mb-0 cursor-pointer flex-grow"
                    onClick={() => setSelectedShapeId(shape.id)}
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
                      ></div>
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
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      title="Bring to Front"
                      onClick={() => handleMoveShapeLayer(shape.id, "toFront")}
                      disabled={isLast}
                      className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑↑
                    </button>
                    <button
                      title="Move Forward"
                      onClick={() => handleMoveShapeLayer(shape.id, "forward")}
                      disabled={isLast}
                      className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      title="Move Backward"
                      onClick={() => handleMoveShapeLayer(shape.id, "backward")}
                      disabled={isFirst}
                      className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                    <button
                      title="Send to Back"
                      onClick={() => handleMoveShapeLayer(shape.id, "toBack")}
                      disabled={isFirst}
                      className="px-1 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeShape(shape.id);
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
      </div>
    </div>
  );
}
