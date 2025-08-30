import { ReactNode } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface BusinessLayoutProps {
  children: ReactNode
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  return (
    <>
      {/* Business Header for navigation and sign out */}
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {children}
      </div>
      <Footer />
    </>
  )
}
