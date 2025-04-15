import * as React from "react"

interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ children, className = "" }: TabsProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className = "" }: TabListProps) {
  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

interface TabProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tab({ children, isActive = false, onClick, className = "" }: TabProps) {
  return (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className = "" }: TabPanelProps) {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
}
