"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-2 bg-zinc-950 border-b border-zinc-800 rounded-t-lg">
      <div className="flex items-center gap-3">
        <img
          src="/images.png"
          alt="Logo"
          className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 object-cover"
        />
        <span className="text-lg font-semibold tracking-tight text-white">
          Xeno CRM
        </span>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={user?.image || "/placeholder.svg?height=32&width=32"}
              />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-medium">
              {user?.name || "User"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground text-sm">
              {user?.email || "user@example.com"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="text-red-500 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
