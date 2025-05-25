import React from 'react';
import type { ShapeData, ShapeType } from '../../constants/pixel-shape';
import { SHAPE_TYPES } from '../../constants/pixel-shape';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';

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
  onOpacityChange: (value: number[]) => void;
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
      <div className='h-full flex flex-col space-y-4'>
        {/* Shape Type Selection */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold uppercase tracking-wider'>
              Shape Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={currentShapeType}
              onValueChange={onShapeTypeChange}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a shape type' />
              </SelectTrigger>
              <SelectContent>
                {SHAPE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold uppercase tracking-wider'>
              Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='width' className='text-sm'>
                  Width
                </Label>
                <div className='relative'>
                  <Input
                    id='width'
                    type='number'
                    value={width}
                    onChange={onWidthChange}
                    min='1'
                    max='100'
                    placeholder='Width'
                    className='pr-8'
                  />
                  <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground'>
                    px
                  </span>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='height' className='text-sm'>
                  Height
                </Label>
                <div className='relative'>
                  <Input
                    id='height'
                    type='number'
                    value={height}
                    onChange={onHeightChange}
                    min='1'
                    max='100'
                    placeholder='Height'
                    className='pr-8'
                  />
                  <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground'>
                    px
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className='flex-1'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold uppercase tracking-wider'>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Color Picker */}
            <div className='space-y-2'>
              <Label htmlFor='color' className='text-sm'>
                Color
              </Label>
              <div className='flex items-center space-x-3'>
                <div className='relative'>
                  <input
                    id='color'
                    type='color'
                    value={currentShapeBaseColor}
                    onChange={onColorChange}
                    className='w-12 h-12 rounded-lg border border-input cursor-pointer shadow-sm hover:shadow-md transition-shadow'
                  />
                </div>
                <div className='text-sm font-mono text-muted-foreground'>
                  {currentShapeBaseColor.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label className='text-sm'>Opacity</Label>
                <span className='text-xs font-mono text-muted-foreground'>
                  {Math.round(currentShapeOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[currentShapeOpacity]}
                onValueChange={onOpacityChange}
                max={1}
                min={0}
                step={0.01}
                className='w-full'
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button onClick={onFormSubmit} className='w-full' size='lg'>
          <div className='flex items-center justify-center space-x-2'>
            <span>
              {isEditing
                ? `Update ${selectedShapeObject?.type || 'Shape'}`
                : `Add ${currentShapeType}`}
            </span>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d={isEditing ? 'M5 13l4 4L19 7' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'}
              />
            </svg>
          </div>
        </Button>
      </div>
    );
  }
);
