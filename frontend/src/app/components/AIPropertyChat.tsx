"use client";

import { useState } from "react";
import { HiSparkles } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { Property } from "@/models/Property";

interface AIPropertyChatProps {
  onPropertiesSuggested: (properties: Property[]) => void;
}

interface PropertyChatResponse {
  reply: string;
  clarifyingQuestion?: string;
  properties: Property[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://livelywalls.onrender.com";

function AIPropertyChat({ onPropertiesSuggested }: AIPropertyChatProps) {
  const [message, setMessage] = useState("");
  const [assistantReply, setAssistantReply] = useState(
    "Tell me what you need, like 2BHK near Bellandur under 45k with no broker."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const askAssistant = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/ai/property-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      if (!response.ok) {
        throw new Error("Unable to fetch AI property suggestions");
      }

      const responseData = await response.json();
      const data = responseData.data as PropertyChatResponse;

      setAssistantReply(
        data.clarifyingQuestion
          ? `${data.reply} ${data.clarifyingQuestion}`
          : data.reply
      );
      onPropertiesSuggested(data.properties || []);
      setMessage("");
    } catch (err) {
      console.error("AI property chat error:", err);
      setError("I could not search with AI right now. Try a normal search.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-pink-50 text-pink-700 rounded-full">
          <HiSparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">AI Property Chat</h2>
          <p className="text-xs text-gray-500">Search in natural language</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">
        {assistantReply}
      </p>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              askAssistant();
            }
          }}
          placeholder="2BHK in HSR under 50k"
          className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
        />
        <button
          type="button"
          onClick={askAssistant}
          disabled={isLoading || !message.trim()}
          className="w-10 h-10 rounded-full bg-pink-700 text-white flex items-center justify-center disabled:bg-gray-300 hover:bg-pink-800 transition-colors"
          aria-label="Ask AI"
        >
          <IoSend className="w-4 h-4" />
        </button>
      </div>

      {isLoading && (
        <p className="text-xs text-gray-400 mt-2">Finding matches...</p>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </section>
  );
}

export default AIPropertyChat;
