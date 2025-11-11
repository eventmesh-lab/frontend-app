import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>}
      <input
        className={`w-full px-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
          error ? "border-danger focus:ring-danger" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  )
}
