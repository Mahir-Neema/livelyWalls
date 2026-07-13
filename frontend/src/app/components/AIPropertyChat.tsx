"use client";

import { useState, useRef, useEffect } from "react";
import { HiSparkles, HiTrash } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { Property } from "@/models/Property";

interface AIPropertyChatProps {
  autoFocus?: boolean;
  onPropertiesSuggested: (
    properties: Property[],
    filters: PropertySearchFilters
  ) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PropertyChatResponse {
  reply: string;
  clarifyingQuestion?: string;
  filters: PropertySearchFilters;
  properties: Property[];
  sourceBreakdown?: Record<string, number>;
}

interface PropertySearchFilters {
  location?: string | null;
  city?: string | null;
  propertyType?: string | null;
  listingType?: string | null;
  minRent?: number | null;
  maxRent?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  isAvailable?: boolean | null;
  isBrokerListing?: boolean | null;
  isVegetarianPreferred?: boolean | null;
  isFamilyPreferred?: boolean | null;
  genderPreference?: string | null;
  limit?: number | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://livelywalls.onrender.com";
const SOURCE_STORAGE_KEY = "smilingBricksSearchSource";

const EXAMPLE_PROMPTS = [
  "2BHK in HSR under 50k",
  "No broker 1BHK in Koramangala",
  "3BHK with parking under 60k",
  "Furnished flat near Whitefield",
  "Flatmate wanted in Indiranagar",
];

function AIPropertyChat({ autoFocus, onPropertiesSuggested }: AIPropertyChatProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [lastFilters, setLastFilters] = useState<PropertySearchFilters | null>(
    null
  );
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExamples, setShowExamples] = useState(true);
  const [searchSource, setSearchSource] = useState<"both" | "platform" | "web">(() => {
    try {
      const stored = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      if (stored === "both" || stored === "platform" || stored === "web") return stored;
    } catch {}
    return "platform";
  });

  const hasConversation = conversationHistory.length > 0;

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [autoFocus]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOURCE_STORAGE_KEY, searchSource);
    } catch {}
  }, [searchSource]);

  useEffect(() => {
    if (conversationHistory.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [conversationHistory]);

  const clearChat = () => {
    setMessage("");
    setLastFilters(null);
    setConversationHistory([]);
    setError("");
    setShowExamples(true);
  };

  const askAssistant = async (overrideMessage?: string) => {
    const trimmedMessage = (overrideMessage || message).trim();
    if (!trimmedMessage || isLoading) return;

    setIsLoading(true);
    setError("");
    setShowExamples(false);

    const userMessage: ChatMessage = { role: "user", content: trimmedMessage };
    setConversationHistory((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/ai/property-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          previousFilters: lastFilters,
          conversationHistory: conversationHistory,
          searchSource: searchSource,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to fetch AI property suggestions");
      }

      const responseData = await response.json();
      const data = responseData.data as PropertyChatResponse;

      const replyText = data.clarifyingQuestion
        ? `${data.reply} ${data.clarifyingQuestion}`
        : data.reply;

      const assistantMessage: ChatMessage = { role: "assistant", content: replyText };

      setLastFilters(data.filters || null);
      setConversationHistory((prev) => [...prev, assistantMessage]);
      onPropertiesSuggested(data.properties || [], data.filters);
    } catch (err) {
      console.error("AI property chat error:", err);
      const errorMsg: ChatMessage = { role: "assistant", content: "I could not search with AI right now. Try a normal search." };
      setConversationHistory((prev) => [...prev, errorMsg]);
      setError("I could not search with AI right now. Try a normal search.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setMessage(example);
    setShowExamples(false);
    askAssistant(example);
  };

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-5 flex flex-col h-full min-h-[580px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 text-pink-700 rounded-full">
            <HiSparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              AI Property Chat
            </h2>
            <p className="text-xs text-gray-500">Search in natural language</p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          disabled={isLoading}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Clear AI property chat"
          title="Clear chat"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Search source toggle */}
      <div className="flex gap-1 mb-3">
        {(["platform", "both", "web"] as const).map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => setSearchSource(src)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              searchSource === src
                ? "bg-pink-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {src === "both" ? "All Sources" : src === "platform" ? "SmilingBricks" : "Web"}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0 max-h-[320px] pr-1">
        {!hasConversation && !isLoading && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            Tell me what you need, like 2BHK near Bellandur under 45k with no broker.
          </p>
        )}

        {conversationHistory.map((msg, i) => (
          <div
            key={i}
            className={`text-sm rounded-xl px-3 py-2 max-w-[90%] ${
              msg.role === "user"
                ? "ml-auto bg-pink-700 text-white"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="text-sm text-gray-400 bg-gray-50 rounded-xl px-3 py-2 w-fit">
            Finding matches...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example prompts — above the input */}
      {showExamples && !isLoading && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">Try examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 rounded-full text-xs text-gray-600 bg-gray-50 border border-gray-100 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200 transition-colors text-left"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-auto">
        <input
          ref={inputRef}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              askAssistant();
            }
          }}
          placeholder="2BHK in HSR under 50k"
          className="min-w-0 flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
        />
        <button
          type="button"
          onClick={() => askAssistant()}
          disabled={isLoading || !message.trim()}
          className="w-12 h-12 rounded-full bg-pink-700 text-white flex items-center justify-center disabled:bg-gray-300 hover:bg-pink-800 transition-colors"
          aria-label="Ask AI"
        >
          <IoSend className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </section>
  );
}

export default AIPropertyChat;
