import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface CollapsibleSidebarProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  position: "left" | "right";
  children: React.ReactNode;
  width?: string;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  title,
  isOpen,
  onToggle,
  position,
  children,
  width = "w-80",
}) => {
  const { isDarkMode } = useTheme();

  const sidebarClasses = `
    fixed top-0 ${position === "left" ? "left-0" : "right-0"} h-full ${width}
    transform transition-transform duration-300 ease-in-out z-40
    ${isOpen ? "translate-x-0" : position === "left" ? "-translate-x-full" : "translate-x-full"}
    ${
      isDarkMode
        ? "bg-gray-800 border-gray-700 text-white"
        : "bg-white border-gray-200 text-gray-900"
    }
    border-${position === "left" ? "r" : "l"} shadow-2xl
  `;

  const toggleButtonClasses = `
    fixed top-4 ${position === "left" ? "left-4" : "right-4"} z-50
    p-2 rounded-lg shadow-lg transition-all duration-200
    ${
      isDarkMode
        ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
        : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
    }
    ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
  `;

  const closeBtnClasses = `
    absolute top-4 ${position === "left" ? "right-4" : "left-4"}
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
        onClick={onToggle}
        className={toggleButtonClasses}
        title={`Open ${title}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {position === "left" ? (
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

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Header */}
        <div
          className={`
          flex items-center justify-between p-4 border-b
          ${isDarkMode ? "border-gray-700" : "border-gray-200"}
        `}
        >
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
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};
