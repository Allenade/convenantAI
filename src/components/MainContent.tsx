"use client";

import React from "react";
import { ChevronLeft, Menu, Sparkles, Plus, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { useChatStore } from "@/stores/chat-store";
import { useUIStore } from "@/stores/ui-store";
import type { Message } from "@/types";
import { askCsvBot } from "@/services/csvBotService";
import TextareaAutosize from "react-textarea-autosize";

export function MainContent() {
  const { theme } = useTheme();
  const {
    activeConversation,
    inputValue,
    isLoading,
    setInputValue,
    sendMessage,
    addMessage,
  } = useChatStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // State for menu visibility
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Ref for the menu popover
  const menuRef = React.useRef<HTMLDivElement>(null);

  // State for CSV files and sessionId
  const [payersFile, setPayersFile] = React.useState<File | null>(null);
  const [transactionsFile, setTransactionsFile] = React.useState<File | null>(
    null
  );
  const [sessionId, setSessionId] = React.useState<string | undefined>();
  const [apiLoading, setApiLoading] = React.useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Handlers for file uploads
  const handlePayersUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPayersFile(file);
  };
  const handleTransactionsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTransactionsFile(file);
  };

  // Enhanced handleSend for API integration
  const handleSend = async () => {
    console.log("Send button clicked");
    if (inputValue.trim() && !isLoading && payersFile && transactionsFile) {
      setApiLoading(true);
      try {
        console.log("Sending user message...");
        await sendMessage(inputValue);
        setInputValue("");
        const conversation = activeConversation();
        if (!conversation) throw new Error("No active conversation");
        console.log("Calling API...");
        const data = await askCsvBot({
          query: inputValue,
          payersFile,
          transactionsFile,
          sessionId,
        });
        setSessionId(data.sessionId);
        console.log("API response:", data);
        addMessage(conversation.id, {
          id: Date.now().toString(),
          content: JSON.stringify(data),
          role: "assistant",
          timestamp: new Date(),
        });
      } catch (e) {
        console.error(e);
        const conversation = activeConversation();
        if (conversation) {
          addMessage(conversation.id, {
            id: Date.now().toString(),
            content: "[Error communicating with API]",
            role: "assistant",
            timestamp: new Date(),
          });
        }
      } finally {
        setApiLoading(false);
      }
    } else {
      console.log("Button disabled: missing input or files", {
        inputValue,
        isLoading,
        payersFile,
        transactionsFile,
      });
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
    let parsed = null;
    let parseError = false;
    if (message.role === "assistant") {
      try {
        if (
          typeof message.content === "string" &&
          message.content.trim().startsWith("{")
        ) {
          parsed = JSON.parse(message.content);
        }
      } catch {
        parseError = true;
        parsed = null;
      }
    }
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
          {parsed && parsed.summary ? (
            <div>
              <div className="text-base font-medium mb-1">{parsed.summary}</div>
              {parsed.explanation && (
                <div className="text-xs text-gray-500 mb-2">
                  {parsed.explanation}
                </div>
              )}
              {Array.isArray(parsed.result) && parsed.result.length > 0 && (
                <div className="overflow-x-auto mb-2">
                  <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700 rounded">
                    <thead>
                      <tr>
                        {Object.keys(parsed.result[0]).map((key) => (
                          <th
                            key={key}
                            className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left font-semibold"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.result.map(
                        (row: Record<string, unknown>, i: number) => (
                          <tr
                            key={i}
                            className="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800 dark:even:bg-gray-900"
                          >
                            {Object.values(row).map((val, j) => (
                              <td
                                key={j}
                                className="px-2 py-1 border-b border-gray-100 dark:border-gray-800"
                              >
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {parsed.downloadUrl && (
                <a
                  href={`https://csvbot.onrender.com${parsed.downloadUrl}`}
                  className="inline-block mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download CSV
                </a>
              )}
            </div>
          ) : parseError ? (
            <div className="text-xs text-red-500">
              [Could not parse AI response]
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
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
              <span className="text-orange-400">🌟</span> Welcome Back
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
                  ref={menuRef}
                  className={`absolute left-0 bottom-10 z-50 ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  } shadow-lg rounded-lg p-2 min-w-[200px] border`}
                >
                  <label
                    className={`block w-full text-left px-4 py-2 rounded cursor-pointer ${
                      theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    Upload Payers CSV
                    <input
                      type="file"
                      accept=".csv"
                      style={{ display: "none" }}
                      onChange={handlePayersUpload}
                    />
                  </label>
                  <label
                    className={`block w-full text-left px-4 py-2 rounded cursor-pointer ${
                      theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    Upload Transactions CSV
                    <input
                      type="file"
                      accept=".csv"
                      style={{ display: "none" }}
                      onChange={handleTransactionsUpload}
                    />
                  </label>
                  {payersFile && (
                    <div className="px-4 text-xs text-green-600 truncate">
                      Payers: {payersFile.name}
                    </div>
                  )}
                  {transactionsFile && (
                    <div className="px-4 text-xs text-green-600 truncate">
                      Transactions: {transactionsFile.name}
                    </div>
                  )}
                </div>
              )}
              {/* Hidden file inputs */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={() => {}}
              />
              <input
                id="doc-upload"
                type="file"
                style={{ display: "none" }}
                onChange={() => {}}
              />

              <TextareaAutosize
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                className={`flex-1 bg-transparent border-none resize-none ${
                  theme === "dark"
                    ? "text-gray-200 placeholder-gray-500"
                    : "text-gray-900 placeholder-gray-400"
                } focus:ring-0 focus:outline-none min-h-[24px] max-h-32 p-0`}
                minRows={1}
                maxRows={8}
                disabled={isLoading}
              />

              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                {/* Removed Paperclip button and Claude Sonnet 4 text */}
                <button
                  type="button"
                  onClick={() => {
                    console.log("Send button pressed");
                    handleSend();
                  }}
                  disabled={
                    !inputValue.trim() ||
                    isLoading ||
                    apiLoading ||
                    !payersFile ||
                    !transactionsFile
                  }
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
