import * as React from "react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  label?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, label, helpText, icon, ...props }, ref) => {
    return (
      <div className="relative space-y-2">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <select
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 appearance-none ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${className}`}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
