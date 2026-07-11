"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineSparkles, HiOutlineX } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { Property } from "@/models/Property";

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

interface PropertyChatResponse {
  reply: string;
  clarifyingQuestion?: string;
  filters: PropertySearchFilters;
  properties: Property[];
}

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
  properties?: Property[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://livelywalls.onrender.com";
const STORAGE_KEY = "smilingBricksFloatingPropertyChat";
const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    role: "assistant",
    text: "Tell me what you need. Try: 2BHK in Bellandur under 50k.",
  },
];

interface StoredChatState {
  messages?: ChatMessage[];
  lastFilters?: PropertySearchFilters | null;
}

function FloatingPropertyChat() {
  const router = useRouter();
  const nextMessageId = useRef(1);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lastFilters, setLastFilters] = useState<PropertySearchFilters | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);

  useEffect(() => {
    try {
      const storedChat = window.sessionStorage.getItem(STORAGE_KEY);
      if (!storedChat) return;

      const parsedChat = JSON.parse(storedChat) as StoredChatState;
      if (parsedChat.messages && parsedChat.messages.length > 0) {
        setMessages(parsedChat.messages);
        nextMessageId.current =
          Math.max(...parsedChat.messages.map((item) => item.id)) + 1;
      }
      setLastFilters(parsedChat.lastFilters || null);
    } catch (error) {
      console.error("Unable to restore floating property chat:", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, lastFilters })
      );
    } catch (error) {
      console.error("Unable to save floating property chat:", error);
    }
  }, [messages, lastFilters]);

  const appendMessage = (message: Omit<ChatMessage, "id">) => {
    const id = nextMessageId.current;
    nextMessageId.current += 1;
    setMessages((current) => [...current, { ...message, id }]);
  };

  const openProperty = (property: Property) => {
    const propertyQuery = encodeURIComponent(JSON.stringify(property));
    router.push(`/property/${property.id}?property=${propertyQuery}`);
    setIsOpen(false);
  };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    appendMessage({ role: "user", text: message });
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/property-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          previousFilters: lastFilters,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI property results");
      }

      const responseData = await response.json();
      const data = responseData.data as PropertyChatResponse;
      const reply = data.clarifyingQuestion
        ? `${data.reply} ${data.clarifyingQuestion}`
        : data.reply;

      setLastFilters(data.filters || null);
      appendMessage({
        role: "assistant",
        text:
          data.properties?.length > 0
            ? reply
            : `${reply} I could not find matching properties yet.`,
        properties: data.properties || [],
      });
    } catch (error) {
      console.error("Floating AI property chat error:", error);
      appendMessage({
        role: "assistant",
        text: "I could not search right now. Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <section className="mb-4 w-[calc(100vw-3rem)] max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-pink-50 p-2 text-pink-700">
                <HiOutlineSparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  AI Property Chat
                </h2>
                <p className="text-xs text-gray-500">Ask for homes directly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Close AI property chat"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto bg-gray-50/60 px-4 py-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-pink-700 text-white"
                      : "bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>

                {message.properties && message.properties.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.properties.slice(0, 3).map((property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => openProperty(property)}
                        className="flex w-full gap-3 rounded-xl border border-gray-100 bg-white p-2 text-left shadow-sm hover:border-pink-100 hover:shadow-md"
                      >
                        <img
                          src={property.photos?.[0] || "/example3.png"}
                          alt="Property"
                          className="h-16 w-20 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {property.societyName ||
                              property.location ||
                              "Property"}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {property.bedrooms} BHK • {property.listingType}
                          </p>
                          <p className="text-sm font-extrabold text-blue-600">
                            Rs {property.rent?.toLocaleString()}/mo
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="w-fit rounded-2xl bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                Searching...
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-gray-100 bg-white p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="2BHK in HSR under 50k"
              className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-700 text-white transition-colors hover:bg-pink-800 disabled:bg-gray-300"
              aria-label="Send property chat message"
            >
              <IoSend className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-700 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
          aria-label="Open AI property chat"
        >
          <HiOutlineSparkles className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}

export default FloatingPropertyChat;
