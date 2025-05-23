import { useCanvasInteraction } from "../../hooks/useCanvasInteraction";
import { useShapeManagement } from "../../hooks/useShapeManagement";
import { CanvasArea } from "./CanvasArea";
import { ControlsPanel } from "./ControlsPanel";
import { ShapeList } from "./ShapeList";

export default function PixelShapeGenerator() {
  // Shape management hook
  const shapeManagement = useShapeManagement();

  // Canvas interaction hook
  const canvasInteraction = useCanvasInteraction({
    shapes: shapeManagement.shapes,
    selectedShapeId: shapeManagement.selectedShapeId,
    onShapeSelect: shapeManagement.setSelectedShapeId,
    onShapeMove: shapeManagement.moveShape,
  });

  // Function to calculate new shape position
  const getNewShapePosition = () => {
    let initialX = 50;
    let initialY = 50;

    if (canvasInteraction.viewportContainerRef.current) {
      const { width: cw, height: ch } =
        canvasInteraction.viewportContainerRef.current.getBoundingClientRect();
      initialX =
        (cw / 2 - canvasInteraction.canvasOffset.x) / canvasInteraction.zoom -
        shapeManagement.width / 2;
      initialY =
        (ch / 2 - canvasInteraction.canvasOffset.y) / canvasInteraction.zoom -
        shapeManagement.height / 2;
    }

    return { x: initialX, y: initialY };
  };

  return (
    <div className="flex flex-col items-center w-full p-4 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        Pixel Art Shape Tool
      </h1>

      {/* Controls Panel */}
      <ControlsPanel
        currentShapeType={shapeManagement.currentShapeType}
        width={shapeManagement.width}
        height={shapeManagement.height}
        currentShapeBaseColor={shapeManagement.currentShapeBaseColor}
        currentShapeOpacity={shapeManagement.currentShapeOpacity}
        isEditing={shapeManagement.isEditing}
        selectedShapeObject={shapeManagement.selectedShapeObject}
        onShapeTypeChange={shapeManagement.handleShapeTypeChange}
        onWidthChange={shapeManagement.handleWidthChange}
        onHeightChange={shapeManagement.handleHeightChange}
        onColorChange={shapeManagement.handleColorChange}
        onOpacityChange={shapeManagement.handleOpacityChange}
        onFormSubmit={() =>
          shapeManagement.handleFormSubmit(getNewShapePosition)
        }
      />

      {/* Canvas Area */}
      <CanvasArea
        viewportContainerRef={canvasInteraction.viewportContainerRef}
        zoom={canvasInteraction.zoom}
        canvasOffset={canvasInteraction.canvasOffset}
        shapes={shapeManagement.shapes}
        selectedShapeId={shapeManagement.selectedShapeId}
        snappingGuides={canvasInteraction.snappingGuides}
        isDraggingShape={canvasInteraction.isDraggingShape}
        isPanning={canvasInteraction.isPanning}
        onPointerDown={canvasInteraction.handlePointerDown}
        onWheel={canvasInteraction.handleWheelZoom}
        onResetView={() => {
          canvasInteraction.resetView();
          shapeManagement.resetFormToDefaults();
        }}
      />

      {/* Shape List */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-4xl">
        <ShapeList
          shapes={shapeManagement.shapes}
          selectedShapeId={shapeManagement.selectedShapeId}
          onShapeSelect={shapeManagement.setSelectedShapeId}
          onRemoveShape={shapeManagement.removeShape}
          onMoveShapeLayer={shapeManagement.handleMoveShapeLayer}
        />
      </div>
    </div>
  );
}
