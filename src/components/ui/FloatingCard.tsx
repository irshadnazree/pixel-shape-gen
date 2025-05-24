import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface FloatingCardProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  position: "left" | "right";
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  title,
  isOpen,
  onToggle,
  position,
  children,
  defaultPosition,
}) => {
  const { isDarkMode } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [cardPosition, setCardPosition] = useState(() => {
    if (defaultPosition) return defaultPosition;

    // Safe default calculation
    const windowWidth =
      typeof window !== "undefined" ? window.innerWidth : 1200;
    return {
      x: position === "left" ? 20 : windowWidth - 340,
      y: 100,
    };
  });

  // Update card position to align with button when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const cardWidth = 320; // w-80 = 320px

      let newX = buttonRect.left;
      let newY = buttonRect.bottom + 8; // 8px gap below button

      // Adjust position if card would go off-screen
      if (position === "right" && newX + cardWidth > window.innerWidth) {
        newX = buttonRect.right - cardWidth;
      }

      // Ensure card doesn't go below viewport
      const maxY = window.innerHeight - 400; // Approximate card height
      if (newY > maxY) {
        newY = buttonRect.top - 400 - 8; // Position above button
      }

      setCardPosition({ x: Math.max(8, newX), y: Math.max(8, newY) });
    }
  }, [isOpen, position]);

  // Update position when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (!isOpen || !cardRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - cardRect.width;
      const maxY = window.innerHeight - cardRect.height;

      setCardPosition((prev) => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY)),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const toggleButtonClasses = `
    fixed top-4 ${position === "left" ? "left-4" : "right-4"} z-50
    p-2 rounded-lg shadow-lg transition-all duration-200
    ${
      isDarkMode
        ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
        : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
    }
  `;

  const cardClasses = `
    fixed w-80 max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl border z-40
    transition-all duration-300 ease-in-out select-none
    ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
    ${
      isDarkMode
        ? "bg-gray-800 border-gray-700 text-white"
        : "bg-white border-gray-200 text-gray-900"
    }
  `;

  const headerClasses = `
    flex items-center justify-between p-4 border-b
    ${isDarkMode ? "border-gray-700" : "border-gray-200"}
  `;

  const closeBtnClasses = `
    p-1 rounded-md transition-colors
    ${
      isDarkMode
        ? "hover:bg-gray-700 text-gray-300 hover:text-white"
        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
    }
  `;

  return (
    <>
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={toggleButtonClasses}
        title={`${isOpen ? "Close" : "Open"} ${title}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : position === "left" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m2-12h6m-6 4h6m-6 4h6"
            />
          )}
        </svg>
      </button>

      {/* Floating Card */}
      <div
        ref={cardRef}
        className={cardClasses}
        style={{
          left: `${cardPosition.x}px`,
          top: `${cardPosition.y}px`,
          transformOrigin: position === "left" ? "top left" : "top right",
        }}
      >
        {/* Header */}
        <div className={headerClasses}>
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onToggle}
            className={closeBtnClasses}
            title={`Close ${title}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 max-h-96">{children}</div>
      </div>
    </>
  );
};
