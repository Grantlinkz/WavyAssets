import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary font-semibold hover:bg-primary-hover active:opacity-90 shadow-xs",
        secondary:
          "bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border-hairline hover:border-outline",
        outline:
          "border border-border-hairline bg-transparent hover:bg-surface-container hover:text-on-surface",
        ghost: "hover:bg-surface-container hover:text-on-surface",
        goldOutline:
          "border border-primary/60 text-primary hover:bg-primary/10 hover:border-primary",
        destructive:
          "bg-error text-on-error hover:opacity-90",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 rounded-xs px-2.5 text-[11px]",
        lg: "h-10 rounded-sm px-4 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
