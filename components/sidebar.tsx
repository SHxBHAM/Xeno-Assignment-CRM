"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

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
    label: "Logs",
    icon: FileText,
    href: "/logs",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="fixed left-0 top-0 space-y-4 py-4 flex flex-col h-svh bg-zinc-950 text-white border-r border-zinc-800 w-[240px] shrink-0 shadow-lg">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Xeno CRM</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-zinc-800 rounded-lg transition",
                pathname === route.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400"
              )}
              aria-current={pathname === route.href ? "page" : undefined}
            >
              <div className="flex items-center flex-1 gap-2">
                <route.icon
                  className={cn(
                    "h-5 w-5 mr-2",
                    pathname === route.href
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-white"
                  )}
                />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">Logged in as</p>
            <p className="text-sm font-medium text-white">
              {user?.name || "User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
