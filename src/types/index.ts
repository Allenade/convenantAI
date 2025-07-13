import type React from "react";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: Date;
}

export interface CategoryButton {
  icon: React.ElementType;
  label: string;
  color: string;
}
