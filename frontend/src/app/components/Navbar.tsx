"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import { FiMenu } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/features/auth/authSlice"; 
import { setTokenFromStorage } from '@/lib/features/auth/authSlice';
// import { useRouter } from 'next/navigation'; 

function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const trendingLocations = ["Green Glen Layout", "WhiteField"];
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  // const router = useRouter();


    useEffect(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        dispatch(setTokenFromStorage(token));
      } else {
        console.log("No token found in localStorage");
      }
    }, [dispatch]);


  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    localStorage.removeItem("authToken"); // Remove the token from localStorage
    // router.push('/login'); 
  };

  return (
    <nav className="bg-gray-100 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <div className="font-bold text-xl text-gray-800">
          <Link href="/" className="hover:text-gray-900">
            LivelyWalls
          </Link>
        </div>

        <div className="flex items-center w-full justify-between md:w-auto">
          {/* Search Input */}
          <div className="relative mx-4 rounded-full border-gray-300 flex items-center bg-white pr-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search locations..."
              className="px-4 py-3 rounded-full text-sm w-full md:w-80 focus:outline-none focus:w-100"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="bg-pink-700 text-white p-2 rounded-full font-bold">
              <IoSearchOutline />
            </div>

            {/* Dropdown for search results */}
            {isSearchFocused && (
              <ul className="absolute left-0 top-full w-full md:w-80 bg-white rounded-md shadow-md z-10 mt-2">
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
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link
              href="/popular"
              className="text-gray-700 hover:text-gray-900 flex items-center"
            >
              <FaArrowTrendUp />
            </Link>
            <Link href="/rent" className="text-gray-700 hover:text-gray-900">
              Rent
            </Link>
            <Link
              href="/addproperty"
              className="text-gray-700 hover:text-gray-900"
            >
              Add Property
            </Link>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FiMenu className="text-xl" />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`md:hidden absolute top-0 left-0 bg-gray-100 w-full py-4 mt-4 transition-all duration-300 ease-in-out transform ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-4 items-center">
          <IoCloseSharp
            className="text-gray-700 hover:text-gray-900 text-2xl absolute top-4 right-4"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Link href="/rent" className="text-gray-700 hover:text-gray-900">
            Rent
          </Link>
          <Link
            href="/addproperty"
            className="text-gray-700 hover:text-gray-900"
          >
            Add Property
          </Link>
          {isAuthenticated ? (
              <button onClick={handleLogout} className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
