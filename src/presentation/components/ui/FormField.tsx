import type { ReactNode } from "react"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export default function FormField({ label, error, required = false, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  )
}
