import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    
    const variants = {
      default: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      primary: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800",
      secondary: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:hover:bg-emerald-800",
      success: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800",
      warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800",
      danger: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800",
      outline: "border border-gray-200 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
    };
    
    const sizes = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-0.5",
      lg: "text-base px-3 py-1",
    };
    
    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];
    
    return (
      <div
        className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
