"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Home, LayoutDashboard, MessageSquare, PlusCircle, Settings, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Campaigns",
    icon: MessageSquare,
    href: "/campaigns",
  },
  {
    label: "Create Campaign",
    icon: PlusCircle,
    href: "/campaigns/create",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "API Docs",
    icon: Home,
    href: "/api-docs",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-900 text-white border-r border-zinc-800 w-[240px] shrink-0">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-8">
          <h1 className="text-2xl font-bold">Xeno CRM</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-zinc-800 rounded-lg transition",
                pathname === route.href ? "bg-zinc-800 text-white" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3 text-zinc-400" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">Logged in as</p>
            <p className="text-sm font-medium">{user?.name || "User"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
