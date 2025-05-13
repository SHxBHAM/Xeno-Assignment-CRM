import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: any) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:pointer-events-none",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" &&
          "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
        variant === "outline" &&
          "bg-transparent border border-zinc-700 text-white hover:bg-zinc-800",
        variant === "ghost" && "bg-transparent text-zinc-400 hover:bg-zinc-800",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-base",
        size === "lg" && "h-12 px-6 text-lg",
        className
      )}
    />
  );
}
