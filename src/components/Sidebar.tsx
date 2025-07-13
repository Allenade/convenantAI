"use client";

import {
  Sun,
  Moon,
  X,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useChatStore } from "@/stores/chat-store";
import { useUIStore } from "@/stores/ui-store";

interface SidebarProps {
  formatTimeAgo: (date: Date) => string;
}

export function Sidebar({ formatTimeAgo }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const {
    conversations,
    activeConversationId,
    createNewConversation,
    selectConversation,
    deleteConversation,
  } = useChatStore();
  const { sidebarOpen, isMobile, setSidebarOpen, closeSidebarOnMobile } =
    useUIStore();

  const handleNewConversation = () => {
    createNewConversation();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    closeSidebarOnMobile();
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
  };

  return (
    <div
      className={`${sidebarOpen ? "w-80" : "w-0"} ${
        isMobile ? "fixed left-0 top-0 h-full z-50" : "relative"
      } ${
        theme === "dark"
          ? "bg-[#0f0f0f] border-gray-800"
          : "bg-gray-50 border-gray-200"
      } border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold">Convenant</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            {isMobile && (
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleNewConversation}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          New conversation
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="relative group mb-1">
              <button
                type="button"
                onClick={() => handleSelectConversation(conversation.id)}
                className={`inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground w-full p-3 h-auto text-left ${
                  activeConversationId === conversation.id
                    ? theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : theme === "dark"
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.title}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatTimeAgo(conversation.lastMessage)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Delete button on hover */}
              <button
                type="button"
                onClick={() => handleDeleteConversation(conversation.id)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-500/20 text-red-400 absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          type="button"
          className={`inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground w-full ${
            theme === "dark"
              ? "hover:bg-gray-800 text-gray-400"
              : "hover:bg-gray-200 text-gray-600"
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>
    </div>
  );
}
