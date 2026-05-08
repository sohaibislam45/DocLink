import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-primary text-white hover:bg-accent-primary/80",
        secondary:
          "border-transparent bg-accent-secondary text-white hover:bg-accent-secondary/80",
        destructive:
          "border-transparent bg-danger text-white hover:bg-danger/80",
        outline: "text-text-primary border-border",
        success: "border-transparent bg-success text-white hover:bg-success/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
