
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-black/15 backdrop-blur-md shadow-none rounded-xl border border-white/5 text-card-foreground",
      "transition-all duration-200 ease-out hover:shadow-[0_0_16px_4px_hsl(var(--primary)/0.35),_0_2px_8px_hsl(var(--background)/0.3)] hover:border-primary hover:-translate-y-0.5 hover:scale-[1.005]", // Reduced hover effect
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 p-1.5", className)} // Reduced padding and space
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement, // Corrected to HTMLDivElement
  React.HTMLAttributes<HTMLHeadingElement> // Kept HTMLHeadingElement for semantic prop typing
>(({ className, ...props }, ref) => (
  <h3 // Changed div to h3 for semantic correctness of a title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground", // Reduced text size
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement, // Corrected to HTMLParagraphElement
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p // Changed div to p for semantic correctness of a description
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)} // Reduced text size
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-1.5 pt-0", className)} {...props} /> // Reduced padding
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-1.5 pt-0", className)} // Reduced padding
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
