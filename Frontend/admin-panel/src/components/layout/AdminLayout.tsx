import React, { type ReactNode } from "react"
import { TopBar } from "./TopBar"
import { AdminSidebar } from "./AdminSidebar"
import { CommandPalette } from "../common/CommandPalette"
import { AdminLoginModal } from "../auth/AdminLoginModal"

interface AdminLayoutProps {
  children: ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-bg-canvas text-on-surface flex flex-col">
      <TopBar />
      <AdminSidebar />
      <div className="pl-[260px] pt-[90px] min-h-screen w-full flex flex-col flex-1">
        <main className="w-full flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
      <CommandPalette />
      <AdminLoginModal />
    </div>
  )
}
