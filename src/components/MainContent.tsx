"use client";

import React from "react";
import { ChevronLeft, Menu, Sparkles, Plus, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useChatStore } from "@/stores/chat-store";
import { useUIStore } from "@/stores/ui-store";
import type { Message } from "@/types";

export function MainContent() {
  const { theme } = useTheme();
  const {
    activeConversation,
    inputValue,
    isLoading,
    setInputValue,
    sendMessage,
  } = useChatStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // State for menu visibility
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Handlers for file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: handle image file upload
      alert(`Selected image: ${file.name}`);
    }
  };
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: handle document file upload
      alert(`Selected document: ${file.name}`);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Inlined MessageItem component
  const MessageItem = ({ message }: { message: Message }) => {
    return (
      <div
        className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
      >
        {message.role === "assistant" && (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        <div
          className={`max-w-[80%] ${
            message.role === "user"
              ? "bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3"
              : "bg-transparent"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <p
            className={`text-xs mt-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {message.role === "user" && (
          <div
            className={`w-8 h-8 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            } rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-sm font-medium">U</span>
          </div>
        )}
      </div>
    );
  };

  // Inlined TypingIndicator component
  const TypingIndicator = () => {
    return (
      <div className="flex gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 ${
              theme === "dark" ? "bg-gray-400" : "bg-gray-600"
            } rounded-full animate-bounce`}
          />
          <div
            className={`w-2 h-2 ${
              theme === "dark" ? "bg-gray-400" : "bg-gray-600"
            } rounded-full animate-bounce [animation-delay:0.1s]`}
          />
          <div
            className={`w-2 h-2 ${
              theme === "dark" ? "bg-gray-400" : "bg-gray-600"
            } rounded-full animate-bounce [animation-delay:0.2s]`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 ${
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-200 text-gray-600"
            }`}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
          {activeConversation() && (
            <h2
              className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              } truncate`}
            >
              {activeConversation()!.title}
            </h2>
          )}
        </div>
        {/* Removed Upgrade button and Free plan text */}
      </div>

      {/* Chat Area or Welcome Screen */}
      {activeConversation() ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 px-8 py-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {activeConversation()!.messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
          {/* Greeting */}
          <div className="text-center mb-12">
            <h1
              className={`text-4xl font-light mb-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              <span className="text-orange-400">🌟</span> hello Convenant
            </h1>
          </div>

          {/* Removed Category Buttons */}
        </div>
      )}

      {/* Input Area */}
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div
            className={`relative ${
              theme === "dark"
                ? "bg-gray-900/50 border-gray-700"
                : "bg-gray-50 border-gray-300"
            } border rounded-2xl p-4`}
          >
            <div className="flex items-start gap-3 relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground w-8 h-8 p-0 ${
                  theme === "dark"
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } rounded-lg flex-shrink-0 mt-1`}
              >
                <Plus className="w-4 h-4" />
              </button>
              {/* Menu Popover */}
              {menuOpen && (
                <div
                  className={`absolute left-0 bottom-10 z-50 ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  } shadow-lg rounded-lg p-2 min-w-[160px] border`}
                >
                  <button
                    onClick={() => {
                      document.getElementById("image-upload")?.click();
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded ${
                      theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    Add Photo
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("doc-upload")?.click();
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded ${
                      theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    Upload Document
                  </button>
                </div>
              )}
              {/* Hidden file inputs */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <input
                id="doc-upload"
                type="file"
                style={{ display: "none" }}
                onChange={handleDocUpload}
              />

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                className={`flex-1 bg-transparent border-none resize-none ${
                  theme === "dark"
                    ? "text-gray-200 placeholder-gray-500"
                    : "text-gray-900 placeholder-gray-400"
                } focus:ring-0 focus:outline-none min-h-[24px] max-h-32 p-0`}
                rows={1}
                disabled={isLoading}
              />

              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                {/* Removed Paperclip button and Claude Sonnet 4 text */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg"
                >
                  <ArrowUp className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
