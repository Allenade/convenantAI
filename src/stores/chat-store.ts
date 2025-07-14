import { Conversation, Message } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ChatState {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  inputValue: string;
  isLoading: boolean;

  // Computed values (getters)
  activeConversation: () => Conversation | undefined;
  isNewChat: () => boolean;

  // Actions
  setInputValue: (value: string) => void;
  setActiveConversation: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => void;
}

const initialConversations: Conversation[] = [
  {
    id: "1",
    title: "Tax and Transaction Records",
    messages: [
      {
        id: "1",
        content: "Show me companies with transaction amount above 100.",
        role: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "2",
        content: "There are 6 companies with a transaction amount above 100.",
        role: "assistant",
        timestamp: new Date(Date.now() - 1000 * 60 * 29),
      },
    ],
    lastMessage: new Date(Date.now() - 1000 * 60 * 29),
  },
  {
    id: "2",
    title: "Highest Tax Payers",
    messages: [
      {
        id: "3",
        content: "Who paid the highest tax?",
        role: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: "4",
        content: "David Wilson Inc paid the highest tax.",
        role: "assistant",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
    lastMessage: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      conversations: initialConversations,
      activeConversationId: null,
      inputValue: "",
      isLoading: false,

      // Computed values (getters)
      activeConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId);
      },

      isNewChat: () => {
        const { activeConversationId } = get();
        return !activeConversationId;
      },

      // Simple setters
      setInputValue: (value: string) => {
        set({ inputValue: value }, false, "setInputValue");
      },

      setActiveConversation: (id: string | null) => {
        set({ activeConversationId: id }, false, "setActiveConversation");
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, "setLoading");
      },

      // Complex actions
      createNewConversation: () => {
        set(
          {
            activeConversationId: null,
            inputValue: "",
          },
          false,
          "createNewConversation"
        );
      },

      selectConversation: (id: string) => {
        set({ activeConversationId: id }, false, "selectConversation");
      },

      deleteConversation: (id: string) => {
        const { conversations, activeConversationId } = get();
        const newConversations = conversations.filter((c) => c.id !== id);

        set(
          {
            conversations: newConversations,
            activeConversationId:
              activeConversationId === id ? null : activeConversationId,
          },
          false,
          "deleteConversation"
        );
      },

      addMessage: (conversationId: string, message: Message) => {
        const { conversations } = get();

        set(
          {
            conversations: conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, message],
                    lastMessage: new Date(),
                  }
                : conv
            ),
          },
          false,
          "addMessage"
        );
      },

      sendMessage: async (content: string) => {
        if (!content.trim()) return;

        const {
          activeConversationId,
          conversations,
          addMessage,
          setLoading,
          setInputValue,
        } = get();

        // Create user message
        const userMessage: Message = {
          id: Date.now().toString(),
          content: content.trim(),
          role: "user",
          timestamp: new Date(),
        };

        let conversationId = activeConversationId;

        // Create new conversation if needed
        if (!conversationId) {
          conversationId = Date.now().toString();
          const newConversation: Conversation = {
            id: conversationId,
            title:
              content.trim().slice(0, 30) +
              (content.trim().length > 30 ? "..." : ""),
            messages: [userMessage],
            lastMessage: new Date(),
          };

          set(
            {
              conversations: [newConversation, ...conversations],
              activeConversationId: conversationId,
            },
            false,
            "createConversationAndAddMessage"
          );
        } else {
          // Add to existing conversation
          addMessage(conversationId, userMessage);
        }

        // Clear input and show loading
        setInputValue("");
        setLoading(true);

        // Simulate AI response
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "on it",
            role: "assistant",
            timestamp: new Date(),
          };

          addMessage(conversationId!, assistantMessage);
          setLoading(false);
        }, 1500);
      },
    }),
    {
      name: "chat-store",
    }
  )
);
