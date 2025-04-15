import * as React from "react"

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export function Toggle({ label, description, className = "", ...props }: ToggleProps) {
  const id = React.useId();
  
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        {label && (
          <label htmlFor={id} className="font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {description && (
          <p className="text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}
