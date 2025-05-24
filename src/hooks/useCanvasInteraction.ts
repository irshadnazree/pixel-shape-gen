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
  isSpacePressed: boolean;
}

interface TouchState {
  lastTouchDistance: number;
  initialZoom: number;
  initialOffset: { x: number; y: number };
  lastPinchTime: number;
  pinchVelocity: number;
  velocityHistory: { distance: number; time: number }[];
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
    isSpacePressed: false,
  });

  // Interaction state
  const [pointerStartPos, setPointerStartPos] = useState({ x: 0, y: 0 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [touchState, setTouchState] = useState<TouchState>({
    lastTouchDistance: 0,
    initialZoom: 10,
    initialOffset: { x: 0, y: 0 },
    lastPinchTime: 0,
    pinchVelocity: 0,
    velocityHistory: [],
  });

  // Refs
  const dragShapeStartOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const viewportContainerRef = useRef<HTMLDivElement>(null);
  const zoomAnimationRef = useRef<number | null>(null);

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
      isSpacePressed: false,
    });
    onShapeSelect(null);
  }, [onShapeSelect]);

  // Enhanced zoom function with smooth animation
  const smoothZoom = useCallback((
    targetZoom: number,
    mouseX: number,
    mouseY: number,
    duration: number = 200
  ) => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
    }

    const startZoom = state.zoom;
    const startOffset = { ...state.canvasOffset };
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentZoom = startZoom + (targetZoom - startZoom) * eased;
      
      // Calculate world coordinates at mouse position
      const worldX = (mouseX - startOffset.x) / startZoom;
      const worldY = (mouseY - startOffset.y) / startZoom;
      
      const newOffset = {
        x: mouseX - worldX * currentZoom,
        y: mouseY - worldY * currentZoom,
      };

      updateState({
        zoom: currentZoom,
        canvasOffset: newOffset,
      });

      if (progress < 1) {
        zoomAnimationRef.current = requestAnimationFrame(animate);
      } else {
        zoomAnimationRef.current = null;
      }
    };

    zoomAnimationRef.current = requestAnimationFrame(animate);
  }, [state.zoom, state.canvasOffset, updateState]);

  // Handle space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !state.isSpacePressed) {
        e.preventDefault();
        updateState({ isSpacePressed: true });
        if (viewportContainerRef.current) {
          viewportContainerRef.current.style.cursor = 'grab';
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        updateState({ isSpacePressed: false });
        if (viewportContainerRef.current) {
          viewportContainerRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isSpacePressed, updateState]);

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
          setTouchState({
            lastTouchDistance: 0, // Will be set in first move event
            initialZoom: state.zoom,
            initialOffset: state.canvasOffset,
            lastPinchTime: currentTime,
            pinchVelocity: 0,
            velocityHistory: [],
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

      // Double-click to zoom (with smooth animation)
      if (isDoubleClick && !('touches' in e)) {
        const { left, top } = viewportContainerRef.current.getBoundingClientRect();
        const centerX = e.clientX - left;
        const centerY = e.clientY - top;

        const newZoom = Math.min(MAX_ZOOM, state.zoom * 2);
        smoothZoom(newZoom, centerX, centerY);
        return;
      }

      // Check if space is pressed for force panning
      const shouldForcePan = state.isSpacePressed;

      // Single click/touch - check for shape hit
      const { left, top } = viewportContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const mouseXWorld = (clientX - left - state.canvasOffset.x) / state.zoom;
      const mouseYWorld = (clientY - top - state.canvasOffset.y) / state.zoom;

      const hitShape = hitTest(mouseXWorld, mouseYWorld);

      if (hitShape && !shouldForcePan) {
        onShapeSelect(hitShape.id);
        dragShapeStartOffsetRef.current = {
          x: mouseXWorld - hitShape.position.x,
          y: mouseYWorld - hitShape.position.y,
        };
      } else {
        // Prepare for panning
        updateState({ isPanning: true });
        panStartRef.current = { x: clientX, y: clientY };
        if (viewportContainerRef.current) {
          viewportContainerRef.current.style.cursor = 'grabbing';
        }
      }
    },
    [state.canvasOffset, state.zoom, state.isSpacePressed, hitTest, lastClickTime, onShapeSelect, updateState, smoothZoom]
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
          // Two-finger pinch zoom with velocity-based scaling
          const touchCenter = getTouchCenter(e.touches);
          const currentDistance = getTouchDistance(e.touches);
          const currentTime = performance.now();

          if (touchState.lastTouchDistance > 0) {
            // Calculate velocity-based zoom
            const distanceChange = currentDistance - touchState.lastTouchDistance;
            const timeChange = currentTime - touchState.lastPinchTime;
            
            if (timeChange > 0) {
              // Calculate instantaneous velocity (pixels per millisecond)
              const instantVelocity = distanceChange / timeChange;
              
              // Add to velocity history for smoothing
              const newVelocityHistory = [
                ...touchState.velocityHistory,
                { distance: currentDistance, time: currentTime }
              ].slice(-5); // Keep last 5 samples for smoothing
              
              // Calculate smoothed velocity from history
              let smoothedVelocity = instantVelocity;
              if (newVelocityHistory.length >= 2) {
                const firstSample = newVelocityHistory[0];
                const lastSample = newVelocityHistory[newVelocityHistory.length - 1];
                const totalDistanceChange = lastSample.distance - firstSample.distance;
                const totalTimeChange = lastSample.time - firstSample.time;
                
                if (totalTimeChange > 0) {
                  smoothedVelocity = totalDistanceChange / totalTimeChange;
                }
              }
              
              // Apply velocity-based zoom scaling
              // Scale velocity to zoom factor (much more aggressive values)
              const velocityScale = 0.2; // Even more dramatic for instant response
              const maxVelocityEffect = 1.5; // Allow huge velocity-based zoom jumps
              const velocityZoomDelta = Math.max(
                -maxVelocityEffect,
                Math.min(maxVelocityEffect, smoothedVelocity * velocityScale)
              );
              
              // Combine with distance-based zoom for stability
              const distanceRatio = currentDistance / touchState.lastTouchDistance;
              const distanceZoomDelta = (distanceRatio - 1) * 8.0; // Much more aggressive - 8x multiplier!
              
              // Final zoom delta combines both velocity and distance
              const finalZoomDelta = velocityZoomDelta + distanceZoomDelta;
              const newZoom = Math.max(
                MIN_ZOOM,
                Math.min(MAX_ZOOM, state.zoom * (1 + finalZoomDelta))
              );

              const { left, top } = viewportContainerRef.current.getBoundingClientRect();
              const centerX = touchCenter.x - left;
              const centerY = touchCenter.y - top;

              const worldX = (centerX - state.canvasOffset.x) / state.zoom;
              const worldY = (centerY - state.canvasOffset.y) / state.zoom;

              updateState({
                canvasOffset: {
                  x: centerX - worldX * newZoom,
                  y: centerY - worldY * newZoom,
                },
                zoom: newZoom,
                hasMoved: true,
              });
              
              // Update touch state with new velocity data
              setTouchState(prev => ({
                ...prev,
                lastTouchDistance: currentDistance,
                lastPinchTime: currentTime,
                pinchVelocity: smoothedVelocity,
                velocityHistory: newVelocityHistory,
              }));
            }
          } else {
            // Initialize for first measurement
            setTouchState(prev => ({
              ...prev,
              lastTouchDistance: currentDistance,
              lastPinchTime: currentTime,
              velocityHistory: [{ distance: currentDistance, time: currentTime }],
            }));
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

      // Force panning if space is pressed or if explicitly panning
      const shouldPan = state.isPanning || state.isSpacePressed;

      if (selectedShapeId && !shouldPan) {
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
      } else if (shouldPan && state.hasMoved) {
        // Canvas panning (improved for smoother feel)
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
      setTouchState(prev => ({ 
        ...prev, 
        lastTouchDistance: 0,
        pinchVelocity: 0,
        velocityHistory: [],
      }));
      
      // Reset cursor
      if (viewportContainerRef.current) {
        viewportContainerRef.current.style.cursor = state.isSpacePressed ? 'grab' : 'default';
      }
    },
    [state.hasMoved, state.isDraggingShape, state.isPanning, state.isSpacePressed, selectedShapeId, onShapeSelect, updateState]
  );

  // Enhanced wheel zoom (Figma-like)
  const handleWheelZoom = useCallback(
    (e: React.WheelEvent) => {
      if (!viewportContainerRef.current) return;

      // Always prevent default to stop browser zoom
      e.preventDefault();
      e.stopPropagation();

      const { left, top } = viewportContainerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;

      // Detect different input types
      const isPinchGesture = e.ctrlKey;
      const isTrackpadScroll = Math.abs(e.deltaX) > 0 || (Math.abs(e.deltaY) < 100 && !isPinchGesture);
      const isMouseWheel = Math.abs(e.deltaY) >= 100 && !isPinchGesture;

      if (isPinchGesture) {
        // Pinch to zoom
        const zoomDelta = -e.deltaY * 0.01;
        const zoomFactor = Math.pow(1.1, zoomDelta);
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom * zoomFactor));

        const worldX = (mouseX - state.canvasOffset.x) / state.zoom;
        const worldY = (mouseY - state.canvasOffset.y) / state.zoom;

        updateState({
          canvasOffset: {
            x: mouseX - worldX * newZoom,
            y: mouseY - worldY * newZoom,
          },
          zoom: newZoom,
        });
      } else if (isTrackpadScroll) {
        // Two-finger scroll for panning
        updateState({
          canvasOffset: {
            x: state.canvasOffset.x - e.deltaX,
            y: state.canvasOffset.y - e.deltaY,
          },
        });
      } else if (isMouseWheel) {
        // Mouse wheel for zooming
        const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;
        const zoomFactor = Math.pow(1.1, zoomDelta);
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom * zoomFactor));

        // Use smooth animation for mouse wheel
        smoothZoom(newZoom, mouseX, mouseY, 150);
      }
    },
    [state.zoom, state.canvasOffset, updateState, smoothZoom]
  );

  // Handle gesture events (for Safari)
  const handleGestureStart = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGestureChange = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGestureEnd = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Event listeners
  useEffect(() => {
    const container = viewportContainerRef.current;
    if (!container) return;

    // Add gesture event listeners for Safari
    container.addEventListener('gesturestart', handleGestureStart, { passive: false });
    container.addEventListener('gesturechange', handleGestureChange, { passive: false });
    container.addEventListener('gestureend', handleGestureEnd, { passive: false });

    return () => {
      container.removeEventListener('gesturestart', handleGestureStart);
      container.removeEventListener('gesturechange', handleGestureChange);
      container.removeEventListener('gestureend', handleGestureEnd);
    };
  }, [handleGestureStart, handleGestureChange, handleGestureEnd]);

  // Event listeners
  useEffect(() => {
    if (state.isPointerDown) {
      const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
      const handleMouseUp = (e: MouseEvent) => handlePointerUp(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        handlePointerMove(e);
      };
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

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

  return {
    ...state,
    viewportContainerRef,
    handlePointerDown,
    handleWheelZoom,
    resetView,
  };
}; 