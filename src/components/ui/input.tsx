import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  helpText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, icon, helpText, ...props }, ref) => {
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
          <input
            type={type}
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 ${className}`}
            ref={ref}
            {...props}
          />
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

Input.displayName = "Input"

export { Input }
