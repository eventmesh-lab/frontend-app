"use client"

import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
  type?: "button" | "submit" | "reset"
  loading?: boolean
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  loading = false,
}: ButtonProps) {
  const baseClasses =
    "font-medium rounded-md transition-colors duration-200 inline-flex items-center gap-2 justify-center"

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-gray-300",
    secondary: "bg-secondary text-text-primary hover:bg-opacity-90 disabled:bg-gray-300",
    danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  )
}
