import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import type { ShapeData } from '../../constants/pixel-shape';
import { cn } from '../../lib/utils';
import { darkenColor } from '../../utils/pixel-shape';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface SortableShapeCardProps {
  shape: ShapeData;
  index: number;
  totalShapes: number;
  isSelected: boolean;
  onShapeSelect: (id: number) => void;
  onRemoveShape: (id: number) => void;
}

export const SortableShapeCard: React.FC<SortableShapeCardProps> = ({
  shape,
  index,
  totalShapes,
  isSelected,
  onShapeSelect,
  onRemoveShape,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shape.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200 cursor-pointer',
        isDragging && 'opacity-50 scale-95',
        isSelected && 'ring-2 ring-primary/30 bg-primary/5'
      )}
      {...attributes}
    >
      <CardContent className='p-4'>
        {/* Shape Info */}
        <div className='mb-3'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center space-x-2'>
              {/* Drag Handle */}
              <div
                {...listeners}
                className='cursor-grab active:cursor-grabbing p-2 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                title='Drag to reorder'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 8h16M4 16h16'
                  />
                </svg>
              </div>

              <div
                className='cursor-pointer'
                onClick={() => onShapeSelect(shape.id)}
              >
                <span className='text-sm font-semibold text-foreground'>
                  #{totalShapes - index}
                </span>
              </div>

              <div
                className='cursor-pointer'
                onClick={() => onShapeSelect(shape.id)}
              >
                <span className='text-xs capitalize px-2 py-1 rounded-full bg-muted text-muted-foreground'>
                  {shape.type}
                </span>
              </div>
            </div>

            {/* Color Swatches */}
            <div
              className='flex items-center space-x-1 cursor-pointer'
              onClick={() => onShapeSelect(shape.id)}
            >
              <div
                title={`Base: ${shape.baseColor}`}
                className='w-5 h-5 rounded-lg border-2 border-background shadow-sm'
                style={{ backgroundColor: shape.baseColor }}
              />
              <div
                title={`Outline: ${darkenColor(
                  shape.baseColor,
                  0.3,
                  shape.opacity
                )}`}
                className='w-5 h-5 rounded-lg border-2 border-background shadow-sm'
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

          <div
            className='text-xs cursor-pointer text-muted-foreground'
            onClick={() => onShapeSelect(shape.id)}
          >
            {shape.width}×{shape.height}px • Opacity:{' '}
            {Math.round(shape.opacity * 100)}%
            <span className='ml-2 text-xs italic text-muted-foreground/70'>
              Drag handle to reorder
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center justify-end'>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveShape(shape.id);
            }}
            variant='destructive'
            size='sm'
            title='Remove Shape'
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
