interface BadgeProps {
  children: string
  variant?: "success" | "warning" | "danger" | "info" | "primary"
  className?: string
}

export default function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const variantClasses = {
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-danger text-white",
    info: "bg-primary text-white",
    primary: "bg-primary text-white",
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
