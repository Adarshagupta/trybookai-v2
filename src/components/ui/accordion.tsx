import * as React from "react"

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({ title, children, defaultOpen = false, className = "" }: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden ${className}`}>
      <button
        type="button"
        className="flex justify-between items-center w-full px-4 py-3 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionGroup({ children, className = "" }: AccordionGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}
