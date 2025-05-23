# Pixel Shape Generator - Code Organization

## Overview

The Pixel Shape Generator has been successfully refactored from a single large component into a well-organized, modular structure to improve readability, maintainability, and performance.

## File Structure

```
src/
├── constants/
│   └── pixel-shape.ts          # All constants and type definitions
├── utils/
│   └── pixel-shape.ts          # Utility functions for shape operations
├── hooks/
│   └── pixel-shape.ts          # Custom React hooks
├── components/
│   └── PixelShapeGenerator/
│       ├── index.ts            # Main export file
│       ├── PixelShapeGenerator.tsx  # Main component
│       ├── PixelShapeDisplay.tsx    # Shape rendering component
│       └── PixelGridLines.tsx       # Grid overlay component
└── routes/
    └── index.tsx               # Updated route to use new component
```

## Component Architecture

### 1. Constants (`src/constants/pixel-shape.ts`)

- **Purpose**: Centralized configuration and type definitions
- **Contents**:
  - Zoom, snap, and interaction thresholds
  - Shape types and enums
  - TypeScript interfaces for `ShapeData` and `SnappingGuide`

### 2. Utilities (`src/utils/pixel-shape.ts`)

- **Purpose**: Pure functions for shape calculations and color operations
- **Key Functions**:
  - `darkenColor()`: Color manipulation for outlines
  - `isPointInEllipse()`: Geometric calculations
  - `createShapeMask()`: Shape mask generation
  - `isOutlinePixel()`: Outline detection
  - `getTouchDistance()` & `getTouchCenter()`: Touch event helpers

### 3. Custom Hooks (`src/hooks/pixel-shape.ts`)

- **Purpose**: Reusable React logic for state management
- **Hooks**:
  - `useViewportSize()`: Responsive viewport tracking
  - `useShapeHitTest()`: Mouse/touch collision detection

### 4. Components (`src/components/PixelShapeGenerator/`)

#### Main Component (`PixelShapeGenerator.tsx`)

- **Purpose**: Main application logic and UI
- **Responsibilities**:
  - State management for shapes, canvas, and interactions
  - Event handling for mouse/touch interactions
  - Google Maps-style pan/zoom behavior
  - Shape editing and layer management

#### Shape Display (`PixelShapeDisplay.tsx`)

- **Purpose**: Renders individual pixel shapes
- **Features**:
  - Memoized for performance
  - Generates pixel divs based on shape masks
  - Handles outline rendering

#### Grid Lines (`PixelGridLines.tsx`)

- **Purpose**: Renders pixel grid overlay
- **Features**:
  - Viewport-based rendering for performance
  - Zoom-level adaptive visibility
  - Efficient line generation

## Performance Optimizations

1. **Component Memoization**: Both `PixelShapeDisplay` and `PixelGridLines` use `React.memo`
2. **Hook Dependencies**: Optimized dependency arrays to prevent unnecessary re-renders
3. **Viewport Culling**: Grid lines only render within visible area
4. **Pure Functions**: Utilities are side-effect free for better testability

## Key Features

- **Multi-touch Support**: Pinch-to-zoom on mobile devices
- **Shape Snapping**: Visual guides for alignment
- **Layer Management**: Z-order controls for shapes
- **Real-time Editing**: Live updates with form controls
- **Responsive Design**: Works on desktop and mobile

## Usage

The component is now used in the main route (`src/routes/index.tsx`):

```tsx
import PixelShapeGenerator from "../components/PixelShapeGenerator";

export const Route = createFileRoute("/")({
  component: PixelShapeGenerator,
});
```

## Benefits of This Architecture

1. **Maintainability**: Each file has a single responsibility
2. **Reusability**: Hooks and utilities can be used in other components
3. **Testability**: Pure functions are easier to unit test
4. **Performance**: Memoized components prevent unnecessary re-renders
5. **Developer Experience**: Clear separation of concerns and TypeScript support

## Future Enhancements

With this modular structure, you can easily:

- Add new shape types by extending the constants
- Create new interaction modes with additional hooks
- Implement different rendering backends
- Add comprehensive unit tests for each module
  on
