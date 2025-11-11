import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
