"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useUIStore } from "@/stores/ui-store";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";

export default function ClaudeReplica() {
  const { theme } = useTheme();
  const {
    sidebarOpen,
    isMobile,
    mounted,
    setMobile,
    setMounted,
    setSidebarOpen,
  } = useUIStore();
  // Removed unused variables from useChatStore

  // Handle hydration and mobile detection
  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setMobile, setMounted]);

  // Inlined formatTimeAgo utility (used by both Sidebar and MainContent)
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`h-screen flex ${
        theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar formatTimeAgo={formatTimeAgo} />
      <MainContent />
    </div>
  );
}
