import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    fullWidth = false,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-sm hover:shadow",
      secondary: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm hover:shadow",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:border-gray-600",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
      link: "bg-transparent underline-offset-4 hover:underline text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-0 h-auto",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm rounded",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-6 text-lg",
    };

    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];

    return (
      <button
        className={`${baseStyles} ${variantStyle} ${sizeStyle} ${fullWidth ? 'w-full' : ''} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
