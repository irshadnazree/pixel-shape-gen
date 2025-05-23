import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShapeData, SnappingGuide } from '../constants/pixel-shape';
import {
  DOUBLE_CLICK_DELAY,
  DRAG_THRESHOLD,
  MAX_ZOOM,
  MIN_ZOOM,
  SNAP_THRESHOLD_SCREEN,
} from '../constants/pixel-shape';
import { getTouchCenter, getTouchDistance } from '../utils/pixel-shape';

interface UseCanvasInteractionProps {
  shapes: ShapeData[];
  selectedShapeId: number | null;
  onShapeSelect: (id: number | null) => void;
  onShapeMove: (id: number, position: { x: number; y: number }) => void;
}

interface CanvasInteractionState {
  zoom: number;
  canvasOffset: { x: number; y: number };
  isDraggingShape: boolean;
  isPanning: boolean;
  snappingGuides: SnappingGuide[];
  isPointerDown: boolean;
  hasMoved: boolean;
}

interface TouchState {
  lastTouchDistance: number;
  initialZoom: number;
  initialOffset: { x: number; y: number };
}

export const useCanvasInteraction = ({
  shapes,
  selectedShapeId,
  onShapeSelect,
  onShapeMove,
}: UseCanvasInteractionProps) => {
  // Canvas state
  const [state, setState] = useState<CanvasInteractionState>({
    zoom: 10,
    canvasOffset: { x: 0, y: 0 },
    isDraggingShape: false,
    isPanning: false,
    snappingGuides: [],
    isPointerDown: false,
    hasMoved: false,
  });

  // Interaction state
  const [pointerStartPos, setPointerStartPos] = useState({ x: 0, y: 0 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [touchState, setTouchState] = useState<TouchState>({
    lastTouchDistance: 0,
    initialZoom: 10,
    initialOffset: { x: 0, y: 0 },
  });

  // Refs
  const dragShapeStartOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const viewportContainerRef = useRef<HTMLDivElement>(null);

  // State updates
  const updateState = useCallback((updates: Partial<CanvasInteractionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetView = useCallback(() => {
    setState({
      zoom: 10,
      canvasOffset: { x: 0, y: 0 },
      isDraggingShape: false,
      isPanning: false,
      snappingGuides: [],
      isPointerDown: false,
      hasMoved: false,
    });
    onShapeSelect(null);
  }, [onShapeSelect]);

  // Hit testing
  const hitTest = useCallback(
    (mouseXWorld: number, mouseYWorld: number): ShapeData | null => {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        const localX = mouseXWorld - shape.position.x;
        const localY = mouseYWorld - shape.position.y;

        if (
          localX >= 0 &&
          localX < shape.width &&
          localY >= 0 &&
          localY < shape.height
        ) {
          return shape;
        }
      }
      return null;
    },
    [shapes]
  );

  // Handle pointer down
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!viewportContainerRef.current) return;

      e.preventDefault();

      const currentTime = Date.now();
      const isDoubleClick = currentTime - lastClickTime < DOUBLE_CLICK_DELAY;
      setLastClickTime(currentTime);

      // Handle touch events
      if ('touches' in e) {
        const touchCenter = getTouchCenter(e.touches);
        setPointerStartPos({ x: touchCenter.x, y: touchCenter.y });

        if (e.touches.length === 2) {
          // Two-finger touch - prepare for pinch zoom
          const distance = getTouchDistance(e.touches);
          setTouchState({
            lastTouchDistance: distance,
            initialZoom: state.zoom,
            initialOffset: state.canvasOffset,
          });
          updateState({
            isPanning: true,
            isPointerDown: true,
            hasMoved: false,
          });
          return;
        }
      } else {
        // Mouse events
        setPointerStartPos({ x: e.clientX, y: e.clientY });
      }

      updateState({ isPointerDown: true, hasMoved: false });

      // Double-click to zoom
      if (isDoubleClick && !('touches' in e)) {
        const { left, top } = viewportContainerRef.current.getBoundingClientRect();
        const centerX = e.clientX - left;
        const centerY = e.clientY - top;

        const newZoom = Math.min(MAX_ZOOM, state.zoom * 2);
        const worldX = (centerX - state.canvasOffset.x) / state.zoom;
        const worldY = (centerY - state.canvasOffset.y) / state.zoom;

        updateState({
          canvasOffset: {
            x: centerX - worldX * newZoom,
            y: centerY - worldY * newZoom,
          },
          zoom: newZoom,
        });
        return;
      }

      // Single click/touch - check for shape hit
      const { left, top } = viewportContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const mouseXWorld = (clientX - left - state.canvasOffset.x) / state.zoom;
      const mouseYWorld = (clientY - top - state.canvasOffset.y) / state.zoom;

      const hitShape = hitTest(mouseXWorld, mouseYWorld);

      if (hitShape) {
        onShapeSelect(hitShape.id);
        dragShapeStartOffsetRef.current = {
          x: mouseXWorld - hitShape.position.x,
          y: mouseYWorld - hitShape.position.y,
        };
      } else {
        // Prepare for panning
        updateState({ isPanning: true });
        panStartRef.current = { x: clientX, y: clientY };
      }
    },
    [state.canvasOffset, state.zoom, hitTest, lastClickTime, onShapeSelect, updateState]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!state.isPointerDown || !viewportContainerRef.current) return;

      e.preventDefault();

      let clientX: number, clientY: number;

      // Handle touch events
      if ('touches' in e) {
        if (e.touches.length === 2) {
          // Two-finger pinch zoom
          const touchCenter = getTouchCenter(e.touches);
          const currentDistance = getTouchDistance(e.touches);

          if (touchState.lastTouchDistance > 0) {
            const zoomDelta = currentDistance / touchState.lastTouchDistance;
            const newZoom = Math.max(
              MIN_ZOOM,
              Math.min(MAX_ZOOM, touchState.initialZoom * zoomDelta)
            );

            const { left, top } = viewportContainerRef.current.getBoundingClientRect();
            const centerX = touchCenter.x - left;
            const centerY = touchCenter.y - top;

            const worldX = (centerX - touchState.initialOffset.x) / touchState.initialZoom;
            const worldY = (centerY - touchState.initialOffset.y) / touchState.initialZoom;

            updateState({
              canvasOffset: {
                x: centerX - worldX * newZoom,
                y: centerY - worldY * newZoom,
              },
              zoom: newZoom,
              hasMoved: true,
            });
          }
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
        updateState({ hasMoved: true });
      }

      if (selectedShapeId && !state.isPanning) {
        // Shape dragging
        if (distance > DRAG_THRESHOLD) {
          updateState({ isDraggingShape: true });

          const currentMovingShape = shapes.find(s => s.id === selectedShapeId);
          if (!currentMovingShape) return;

          const { left, top } = viewportContainerRef.current.getBoundingClientRect();
          const mouseXWorld = (clientX - left - state.canvasOffset.x) / state.zoom;
          const mouseYWorld = (clientY - top - state.canvasOffset.y) / state.zoom;

          let tentativePos = {
            x: mouseXWorld - dragShapeStartOffsetRef.current.x,
            y: mouseYWorld - dragShapeStartOffsetRef.current.y,
          };

          // Snapping logic
          const activeGuides: SnappingGuide[] = [];
          const snapThresholdWorld = SNAP_THRESHOLD_SCREEN / state.zoom;
          let currentDraggedCenterX = tentativePos.x + currentMovingShape.width / 2;
          let currentDraggedCenterY = tentativePos.y + currentMovingShape.height / 2;

          shapes.forEach(otherShape => {
            if (otherShape.id === selectedShapeId) return;

            const otherCenterX = otherShape.position.x + otherShape.width / 2;
            const otherCenterY = otherShape.position.y + otherShape.height / 2;

            // Vertical snapping
            if (Math.abs(currentDraggedCenterX - otherCenterX) < snapThresholdWorld) {
              tentativePos.x = otherCenterX - currentMovingShape.width / 2;
              currentDraggedCenterX = tentativePos.x + currentMovingShape.width / 2;
              activeGuides.push({
                id: `v-${otherShape.id}`,
                type: 'V',
                x: otherCenterX,
                startY: Math.min(tentativePos.y, otherShape.position.y),
                endY: Math.max(
                  tentativePos.y + currentMovingShape.height,
                  otherShape.position.y + otherShape.height
                ),
              });
            }

            // Horizontal snapping
            currentDraggedCenterY = tentativePos.y + currentMovingShape.height / 2;
            if (Math.abs(currentDraggedCenterY - otherCenterY) < snapThresholdWorld) {
              tentativePos.y = otherCenterY - currentMovingShape.height / 2;
              activeGuides.push({
                id: `h-${otherShape.id}`,
                type: 'H',
                y: otherCenterY,
                startX: Math.min(tentativePos.x, otherShape.position.x),
                endX: Math.max(
                  tentativePos.x + currentMovingShape.width,
                  otherShape.position.x + otherShape.width
                ),
              });
            }
          });

          updateState({ snappingGuides: activeGuides });

          const finalPos = {
            x: Math.round(tentativePos.x),
            y: Math.round(tentativePos.y),
          };

          onShapeMove(selectedShapeId, finalPos);
        }
      } else if (state.isPanning && state.hasMoved) {
        // Canvas panning
        const dx = clientX - panStartRef.current.x;
        const dy = clientY - panStartRef.current.y;
        updateState({
          canvasOffset: {
            x: state.canvasOffset.x + dx,
            y: state.canvasOffset.y + dy,
          },
        });
        panStartRef.current = { x: clientX, y: clientY };
      }
    },
    [
      state,
      selectedShapeId,
      shapes,
      pointerStartPos,
      touchState,
      onShapeMove,
      updateState,
    ]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(
    (_e: MouseEvent | TouchEvent) => {
      if (!state.hasMoved && !state.isDraggingShape && !state.isPanning && selectedShapeId) {
        // Single click on shape without dragging - keep it selected
      } else if (!state.hasMoved && !selectedShapeId) {
        // Single click on empty canvas - deselect
        onShapeSelect(null);
      }

      updateState({
        isPointerDown: false,
        isPanning: false,
        isDraggingShape: false,
        snappingGuides: [],
        hasMoved: false,
      });
      setTouchState(prev => ({ ...prev, lastTouchDistance: 0 }));
    },
    [state.hasMoved, state.isDraggingShape, state.isPanning, selectedShapeId, onShapeSelect, updateState]
  );

  // Handle wheel zoom
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
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom * zoomFactor));

      const { left, top } = viewportContainerRef.current.getBoundingClientRect();
      const mX = e.clientX - left;
      const mY = e.clientY - top;
      const wXBefore = (mX - state.canvasOffset.x) / state.zoom;
      const wYBefore = (mY - state.canvasOffset.y) / state.zoom;

      updateState({
        canvasOffset: {
          x: mX - wXBefore * newZoom,
          y: mY - wYBefore * newZoom,
        },
        zoom: newZoom,
      });
    },
    [state.zoom, state.canvasOffset, updateState]
  );

  // Event listeners
  useEffect(() => {
    if (state.isPointerDown) {
      const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
      const handleMouseUp = (e: MouseEvent) => handlePointerUp(e);
      const handleTouchMove = (e: TouchEvent) => handlePointerMove(e);
      const handleTouchEnd = (e: TouchEvent) => handlePointerUp(e);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [state.isPointerDown, handlePointerMove, handlePointerUp]);

  return {
    ...state,
    viewportContainerRef,
    handlePointerDown,
    handleWheelZoom,
    resetView,
  };
}; 