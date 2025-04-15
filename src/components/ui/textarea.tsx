import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helpText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helpText, ...props }, ref) => {
    return (
      <div className="relative space-y-2">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 ${error ? 'border-red-500 focus:ring-red-500' : ''} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 ${className}`}
          ref={ref}
          {...props}
        />
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

Textarea.displayName = "Textarea"

export { Textarea }
