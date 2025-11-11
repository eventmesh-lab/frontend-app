interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
}

export default function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-4 border-border-light border-t-primary rounded-full animate-spin`}
      ></div>
      {message && <p className="text-text-secondary text-sm">{message}</p>}
    </div>
  )
}
