"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { IoSearchOutline } from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";

function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trendingLocations = ["Green Glen Layout", "WhiteField"];

  return (
    <nav className="bg-gray-100 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <div className="font-bold text-xl text-gray-800">
          <Link href="/" className="hover:text-gray-900">
            LivelyWalls
          </Link>
        </div>

        <div className="flex items-center">
           {/* Search Input */}
          <div className="relative mx-4 rounded-full border-gray-300 flex items-center bg-white pr-2">
            {/* Container for search input with margin */}
            <input
              type="text"
              placeholder="Search locations..."
              className="px-4 py-3 rounded-full text-sm w-80 focus:outline-none focus:w-100"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="bg-pink-700 text-white p-2 rounded-full font-bold">
              <IoSearchOutline />
            </div>

            {/* Dropdown for search results */}
            { isSearchFocused &&
              <ul className="absolute left-0 top-full w-80 bg-white  rounded-md shadow-md z-10 mt-2">
                {/* Match width to input, absolute position */}
                {trendingLocations.map((location, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <div className="px-2">
                      <FaArrowTrendUp />
                    </div>
                    {location}
                  </li>
                ))}
              </ul>
            }
          </div>


            {/* Navigation Links */}
            <div className="flex space-x-6">
            <Link href="/popular" className="text-gray-700 hover:text-gray-900 flex items-center"> 
                <FaArrowTrendUp />
            </Link>
            <Link href="/rent" className="text-gray-700 hover:text-gray-900">
                Rent
            </Link>
            <Link href="/sale" className="text-gray-700 hover:text-gray-900">
                Sale
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
            </Link>
            <Link href="/signup" className="text-gray-700 hover:text-gray-900">
                Sign Up
            </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;