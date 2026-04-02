"use client";

import React from "react";
import { HiOutlineSparkles, HiOutlineLocationMarker } from "react-icons/hi";

interface NearbySuggestionsProps {
  locations: string[];
  onSuggestionClick: (location: string) => void;
  isLoading: boolean;
}

const NearbySuggestions: React.FC<NearbySuggestionsProps> = ({
  locations,
  onSuggestionClick,
  isLoading,
}) => {
  if (!isLoading && locations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <HiOutlineSparkles className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          AI Suggested Areas
        </h3>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-50 rounded-xl animate-pulse w-full border border-gray-50"
            />
          ))
        ) : (
          locations.map((loc, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(loc)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white border border-transparent hover:border-blue-100 transition-all duration-200 group group-hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {loc}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-blue-400 text-xs font-bold">
                GO →
              </div>
            </button>
          ))
        )}
      </div>

    </div>
  );
};

export default NearbySuggestions;
