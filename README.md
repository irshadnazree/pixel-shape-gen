# Pixel Shape Generator

A modern, interactive pixel art shape creation tool built with React, TypeScript, and Vite. Create, edit, and manipulate pixel-perfect shapes.

![Pixel Shape Generator](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat&logo=vite)

## ✨ Features

### 🎨 Shape Creation

- **Multiple Shape Types**: Create ellipses, crescents, and rectangular boxes
- **Customizable Properties**: Adjust width, height, color, and opacity
- **Real-time Preview**: See your shapes as you create them

### 🖱️ Interactive Canvas

- **Google Maps-style Navigation**: Intuitive pan, zoom, and interaction patterns
- **Multi-touch Support**: Pinch-to-zoom and touch gestures on mobile devices
- **Shape Manipulation**: Drag shapes around the canvas with real-time feedback
- **Smart Snapping**: Automatic alignment guides when moving shapes
- **Zoom Controls**: Smooth zooming with mouse wheel or double-click

### 🔧 Advanced Tools

- **Layer Management**: Move shapes to front/back or adjust stacking order
- **Shape Selection**: Click to select and edit existing shapes
- **Visual Feedback**: Clear indication of selected shapes and hover states
- **Grid Display**: Pixel-perfect grid that appears at appropriate zoom levels

### 📱 Responsive Design

- **Mobile-First**: Touch-optimized interface that works on all devices
- **Adaptive Layout**: Responsive design that scales from mobile to desktop
- **Cross-Platform**: Consistent experience across different browsers and devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pixel-shape-gen
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
pnpm build
```

The built files will be in the `dist/` directory.

## 🎯 How to Use

### Creating Shapes

1. **Select Shape Type**: Choose from ellipse, crescent, or box
2. **Set Dimensions**: Adjust width and height (1-100 pixels)
3. **Choose Color**: Pick any color using the color picker
4. **Set Opacity**: Use the slider to adjust transparency (0-100%)
5. **Add Shape**: Click "Add [ShapeType]" to create the shape

### Editing Shapes

1. **Select Shape**: Click on any shape in the canvas or shape list
2. **Modify Properties**: Change any property in the controls panel
3. **Update Shape**: Click "Update [ShapeType]" to apply changes

### Canvas Navigation

- **Pan**: Drag empty areas to move around the canvas
- **Zoom**: Use mouse wheel, pinch gestures, or double-click
- **Reset View**: Click "Reset View" to return to default position

### Shape Management

- **Move Shapes**: Drag shapes to reposition them
- **Layer Control**: Use the arrow buttons in the shape list to change stacking order
- **Delete Shapes**: Click "Remove" button in the shape list
- **Smart Snapping**: Shapes automatically align to centers of other shapes when dragging

## 🏗️ Architecture

This application follows a modern, modular React architecture with clean separation of concerns:

### Custom Hooks

#### `useCanvasInteraction`

Manages all canvas interaction logic:

- Pan and zoom functionality
- Touch and mouse event handling
- Shape dragging with snapping
- Google Maps-style interactions

#### `useShapeManagement`

Handles shape-related operations:

- Shape creation and editing
- Form state management
- Shape manipulation (move, delete, layer operations)
- Selection logic

### Component Structure

```
src/
├── components/PixelShapeGenerator/
│   ├── PixelShapeGenerator.tsx     # Main orchestrator component
│   ├── ControlsPanel.tsx           # Shape creation and editing controls
│   ├── CanvasArea.tsx              # Interactive canvas area
│   ├── ShapeList.tsx               # Shape management interface
│   ├── PixelGridLines.tsx          # Grid rendering component
│   └── PixelShapeDisplay.tsx       # Individual shape display
├── hooks/
│   ├── useCanvasInteraction.ts     # Canvas interaction logic
│   ├── useShapeManagement.ts       # Shape management logic
│   └── pixel-shape.ts              # Utility hooks
├── utils/
│   └── pixel-shape.ts              # Shape utilities and helpers
└── constants/
    └── pixel-shape.ts              # Application constants
```

### Key Benefits of the Architecture

- **🔧 Maintainable**: Each component has a single responsibility
- **🚀 Performant**: Optimized with React.memo and proper memoization
- **🧪 Testable**: Isolated logic makes unit testing straightforward
- **♻️ Reusable**: Custom hooks can be used in other components
- **📈 Scalable**: Easy to extend with new features

## 🛠️ Technical Details

### Technologies Used

- **React 18+**: Modern React with hooks and concurrent features
- **TypeScript 5+**: Full type safety and excellent developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling

### Performance Optimizations

- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Optimized event handlers and callbacks
- **Efficient State Management**: Minimized state updates and proper dependency arrays
- **Event Delegation**: Optimized touch and mouse event handling

### Browser Support

- Modern browsers with ES2020+ support
- Mobile browsers with touch event support
- Tested on Chrome, Firefox, Safari, and Edge

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful component and variable names
- Add proper type annotations
- Write clean, readable code
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern pixel art tools and canvas applications
- Built with the React ecosystem and modern web technologies
- Designed with accessibility and usability in mind

---

**Made with ❤️ using React, TypeScript, and Vite**
