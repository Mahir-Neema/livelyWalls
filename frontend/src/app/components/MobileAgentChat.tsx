"use client";

import { useState, useRef, useEffect } from "react";
import { HiSparkles, HiTrash } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { Property } from "@/models/Property";
import { useRouter } from "next/navigation";

interface MobileAgentChatProps {
  onPropertiesSuggested: (
    properties: Property[],
    filters: PropertySearchFilters
  ) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  properties?: Property[];
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

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
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

const SOURCE_LABELS: Record<string, string> = {
  platform: "SmilingBricks",
  magicbricks: "MagicBricks",
  nobroker: "NoBroker",
  housing: "Housing.com",
  kots: "Kots",
  rentmystay: "RentMyStay",
  facebook: "Facebook",
};

function MobileAgentChat({ onPropertiesSuggested }: MobileAgentChatProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastFilters, setLastFilters] = useState<PropertySearchFilters | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<"both" | "platform" | "web">(() => {
    try {
      const stored = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      if (stored === "both" || stored === "platform" || stored === "web") return stored;
    } catch {}
    return "platform";
  });

  const hasConversation = messages.length > 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(SOURCE_STORAGE_KEY, searchSource);
    } catch {}
  }, [searchSource]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist chat state to sessionStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem("mobile_ai_messages", JSON.stringify(messages));
        sessionStorage.setItem("mobile_ai_history", JSON.stringify(conversationHistory));
        if (lastFilters) {
          sessionStorage.setItem("mobile_ai_filters", JSON.stringify(lastFilters));
        }
        sessionStorage.setItem("ai_search_url_params", window.location.search);
        sessionStorage.setItem("ai_active", "true");
      } catch (e) {}
    }
  }, [messages, conversationHistory, lastFilters]);

  // Restore chat state on mount if the query params match
  useEffect(() => {
    try {
      const active = sessionStorage.getItem("ai_active") === "true";
      const cachedParams = sessionStorage.getItem("ai_search_url_params");
      if (active && cachedParams === window.location.search) {
        const cachedMessages = sessionStorage.getItem("mobile_ai_messages");
        const cachedHistory = sessionStorage.getItem("mobile_ai_history");
        const cachedFilters = sessionStorage.getItem("mobile_ai_filters");
        if (cachedMessages) {
          setMessages(JSON.parse(cachedMessages));
        }
        if (cachedHistory) {
          setConversationHistory(JSON.parse(cachedHistory));
        }
        if (cachedFilters) {
          setLastFilters(JSON.parse(cachedFilters));
        }
      }
    } catch (e) {}
  }, []);

  const clearChat = () => {
    setMessage("");
    setMessages([]);
    setLastFilters(null);
    setConversationHistory([]);
    try {
      sessionStorage.removeItem("mobile_ai_messages");
      sessionStorage.removeItem("mobile_ai_history");
      sessionStorage.removeItem("mobile_ai_filters");
      sessionStorage.removeItem("ai_search_url_params");
      sessionStorage.removeItem("ai_active");
      sessionStorage.removeItem("ai_properties");
      sessionStorage.removeItem("ai_filters");
    } catch (e) {}
  };

  const askAssistant = async (overrideMessage?: string) => {
    const trimmedMessage = (overrideMessage || message).trim();
    if (!trimmedMessage || isLoading) return;

    setIsLoading(true);

    const userMsg: ChatMessage = { role: "user", content: trimmedMessage };
    setMessages((prev) => [...prev, userMsg]);
    setConversationHistory((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/ai/property-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          previousFilters: lastFilters,
          conversationHistory: conversationHistory,
          searchSource: searchSource,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI property results");

      const responseData = await response.json();
      const data = responseData.data as PropertyChatResponse;

      const replyText = data.clarifyingQuestion
        ? `${data.reply} ${data.clarifyingQuestion}`
        : data.reply;

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: replyText,
        properties: data.properties || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastFilters(data.filters || null);
      setConversationHistory((prev) => [...prev, { role: "assistant", content: replyText }]);
      onPropertiesSuggested(data.properties || [], data.filters);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I could not search right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openProperty = (property: Property) => {
    const propertyQuery = encodeURIComponent(JSON.stringify(property));
    router.push(`/property/${property.id}?property=${propertyQuery}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 text-pink-700 rounded-full">
            <HiSparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">AI Property Agent</h2>
            <p className="text-[10px] text-gray-500">Search across SmilingBricks + Web</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasConversation && (
            <button
              onClick={clearChat}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Source toggle */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-50 bg-white shrink-0">
        {(["platform", "both", "web"] as const).map((src) => (
          <button
            key={src}
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

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!hasConversation && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-pink-50 text-pink-700 rounded-full mb-4">
              <HiSparkles className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Find your perfect home</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Describe what you&apos;re looking for and I&apos;ll search across multiple platforms.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setMessage(example);
                    askAssistant(example);
                  }}
                  className="px-3 py-2 rounded-xl text-xs text-gray-600 bg-gray-50 border border-gray-100 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : ""}`}>
              {/* Message bubble */}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-pink-700 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>

              {/* Inline property cards */}
              {msg.properties && msg.properties.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.properties.slice(0, 5).map((property) => {
                    const sourceLabel = property.source
                      ? SOURCE_LABELS[property.source] || property.source
                      : null;
                    const isPlatform = property.source === "platform";

                    return (
                      <button
                        key={property.id}
                        onClick={() => openProperty(property)}
                        className="flex w-full gap-3 rounded-xl border border-gray-100 bg-white p-2.5 text-left shadow-sm hover:border-pink-100 hover:shadow-md transition-all"
                      >
                        <img
                          src={property.photos?.[0] || "/example3.png"}
                          alt="Property"
                          className="h-20 w-24 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {property.title || property.societyName || property.location || "Property"}
                          </p>
                          <p className="truncate text-xs text-gray-500 mt-0.5">
                            {property.bedrooms} BHK • {property.listingType}
                            {property.furnishing ? ` • ${property.furnishing}` : ""}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm font-extrabold text-blue-600">
                              ₹{property.rent?.toLocaleString()}/mo
                            </p>
                            {sourceLabel && (
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  isPlatform
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {sourceLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {msg.properties.length > 5 && (
                    <p className="text-xs text-gray-400 text-center">
                      + {msg.properties.length - 5} more results shown in the list
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-500">
              <span className="animate-pulse">Searching...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askAssistant();
            }}
            placeholder="2BHK in HSR under 50k"
            className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
          />
          <button
            onClick={() => askAssistant()}
            disabled={isLoading || !message.trim()}
            className="w-12 h-12 rounded-full bg-pink-700 text-white flex items-center justify-center disabled:bg-gray-300 hover:bg-pink-800 transition-colors shrink-0"
            aria-label="Send"
          >
            <IoSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileAgentChat;
