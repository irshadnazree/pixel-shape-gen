import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React from 'react';
import type { ShapeData } from '../../constants/pixel-shape';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SortableShapeCard } from './SortableShapeCard.tsx';

interface ShapeListProps {
  shapes: ShapeData[];
  selectedShapeId: number | null;
  onShapeSelect: (id: number) => void;
  onRemoveShape: (id: number) => void;
  onMoveShapeLayer: (id: number, direction: string) => void;
  onReorderShapes?: (fromIndex: number, toIndex: number) => void;
}

export const ShapeList = React.memo<ShapeListProps>(
  ({
    shapes,
    selectedShapeId,
    onShapeSelect,
    onRemoveShape,
    onMoveShapeLayer,
    onReorderShapes,
  }) => {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // 8px of movement required before dragging starts
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = shapes.findIndex((shape) => shape.id === active.id);
        const newIndex = shapes.findIndex((shape) => shape.id === over?.id);

        if (onReorderShapes) {
          onReorderShapes(oldIndex, newIndex);
        } else {
          // Fallback to using existing layer movement functions
          const draggedShape = shapes[oldIndex];

          if (oldIndex < newIndex) {
            // Moving down the list
            for (let i = 0; i < newIndex - oldIndex; i++) {
              onMoveShapeLayer(draggedShape.id, 'forward');
            }
          } else {
            // Moving up the list
            for (let i = 0; i < oldIndex - newIndex; i++) {
              onMoveShapeLayer(draggedShape.id, 'backward');
            }
          }
        }
      }
    };

    if (shapes.length === 0) {
      return (
        <div className='h-full flex flex-col'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold uppercase tracking-wider'>
                Shape List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm italic text-muted-foreground'>
                No shapes on the canvas yet.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className='h-full flex flex-col space-y-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold uppercase tracking-wider'>
              Shape List ({shapes.length})
            </CardTitle>
          </CardHeader>
        </Card>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <div className='flex-1 space-y-3 overflow-y-auto pr-1'>
            <SortableContext
              items={shapes.map((shape) => shape.id)}
              strategy={verticalListSortingStrategy}
            >
              {shapes.map((shape, index) => (
                <SortableShapeCard
                  key={shape.id}
                  shape={shape}
                  index={index}
                  totalShapes={shapes.length}
                  isSelected={selectedShapeId === shape.id}
                  onShapeSelect={onShapeSelect}
                  onRemoveShape={onRemoveShape}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>
    );
  }
);
