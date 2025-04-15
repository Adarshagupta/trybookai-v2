import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles = "rounded-lg transition-all duration-200";
    
    const variants = {
      default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      outline: "border border-gray-200 dark:border-gray-700 bg-transparent",
      elevated: "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg",
    };
    
    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    };
    
    const variantStyle = variants[variant];
    const paddingStyle = paddings[padding];
    
    return (
      <div
        className={`${baseStyles} ${variantStyle} ${paddingStyle} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export { Card }

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => {
    return (
      <div
        className={`flex flex-col space-y-1.5 pb-4 ${className}`}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    )
  }
)

CardHeader.displayName = "CardHeader"

export { CardHeader }

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`pt-0 ${className}`}
      {...props}
    />
  )
})

CardContent.displayName = "CardContent"

export { CardContent }

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center pt-4 ${className}`}
      {...props}
    />
  )
})

CardFooter.displayName = "CardFooter"

export { CardFooter }
