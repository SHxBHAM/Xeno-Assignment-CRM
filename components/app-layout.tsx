"use client";

import type React from "react";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-6 bg-zinc-950">
        <header className="mb-8">
          <Header />
        </header>
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
