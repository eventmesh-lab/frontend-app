import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-border-light p-6 ${
        hover ? "hover:shadow-lg hover:border-primary transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}
