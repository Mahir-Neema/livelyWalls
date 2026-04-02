"use client";

import React from "react";

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center space-x-3 group">
      <div
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <label
        htmlFor={id}
        onClick={onChange}
        className="text-lg font-medium text-gray-800 cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
};

export default Toggle;
