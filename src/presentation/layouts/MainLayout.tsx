import type { ReactNode } from "react"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import NotificationCenter from "../components/common/NotificationCenter"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Navbar />
      <NotificationCenter />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
