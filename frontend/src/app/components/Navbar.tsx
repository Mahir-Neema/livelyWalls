"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import { FiMenu } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/features/auth/authSlice";
import { auth } from "@/lib/firebase";
import { setTokenFromStorage } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";

function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(""); // State for search input
  const [trendingLocations, setTrendingLocations] = useState([
    "Green Glen Layout",
    "WhiteField",
  ]);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      dispatch(setTokenFromStorage(token));
    } else {
      console.log("No token found in localStorage");
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchTrendingLocations = async () => {
      try {
        const storedData = localStorage.getItem("trendingLocations");
        const storedTimestamp = localStorage.getItem(
          "trendingLocationsTimestamp"
        );
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

        // If data exists and is less than 2 hours old, use it
        if (
          storedData &&
          storedTimestamp &&
          now - parseInt(storedTimestamp) < twoHours
        ) {
          console.log("Using cached trending locations");
          setTrendingLocations(JSON.parse(storedData));
          return;
        }

        const response = await fetch(
          "https://livelywalls.onrender.com/search/popular-places"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch trending locations");
        }
        const Responsedata = await response.json();
        setTrendingLocations(Responsedata.data || []);

        localStorage.setItem(
          "trendingLocations",
          JSON.stringify(Responsedata.data || [])
        );
        localStorage.setItem("trendingLocationsTimestamp", now.toString());
      } catch (error) {
        console.error("Error fetching trending locations:", error);
        setTrendingLocations(["Green Glen Layout", "WhiteField"]);
      }
    };

    fetchTrendingLocations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const signOut = async () => {
    await auth.signOut(); // google signout
  };

  const handleLogout = async () => {
    if (isAuthenticated) {
      try {
        await signOut();
        console.log("Signed out from Google successfully.");
      } catch (error) {
        console.error("Error signing out from Google:", error);
      }
    }

    dispatch(logout());
    localStorage.removeItem("authToken");
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    // Delay to allow click event to fire before closing the dropdown
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 250);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchedLocation(event.target.value); // Update the search input value
  };

  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && searchedLocation) {
      router.push(`/search?location=${searchedLocation}`);
    }
  };

  const handleSearchClick = () => {
    if (searchedLocation !== "") {
      router.push(`/search?location=${searchedLocation}`);
    }
  };

  return (
    <nav className="bg-gray-100 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <div className="font-bold text-xl text-gray-800">
          {/* if mobile then show image else show "Smiling Bricks name" */}
          <Link href="/" className="hidden md:block hover:text-gray-900">
            Smiling Bricks
          </Link>
          <Link href="/" className="md:hidden hover:text-gray-900">
            <img src="/logo3.png" alt="Logo" className="h-12" />
          </Link>
        </div>

        <div className="flex items-center w-full justify-between md:w-auto">
          {/* Search Input */}
          <div className="relative mx-4 rounded-full border-gray-300 flex items-center bg-white pr-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search locations..."
              className="px-4 py-3 rounded-full text-sm w-full md:w-80 focus:outline-none"
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={searchedLocation}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyPress}
            />
            <div className="bg-pink-700 text-white p-2 rounded-full font-bold hover:cursor-pointer">
              <IoSearchOutline onClick={handleSearchClick} />
            </div>

            {/* Dropdown for search results */}
            {isSearchFocused && (
              <ul className="absolute left-0 top-full w-full md:w-80 bg-white rounded-md shadow-md z-10 mt-2">
                {trendingLocations.map((location, index) => (
                  <li key={index}>
                    <Link
                      href={`/search?location=${location}`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => setIsSearchFocused(false)} // Close dropdown after navigation
                    >
                      <div className="px-2">
                        <FaArrowTrendUp />
                      </div>
                      {location}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="/rent" className="text-gray-700 hover:text-gray-900">
              Rent
            </Link>
            {isAuthenticated ? (
              <Link
                href="/addproperty"
                className="text-gray-700 hover:text-gray-900"
              >
                Add Property
              </Link>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Add Property
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 relative flex items-center"
              >
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
        ref={menuRef}
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
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-gray-900 cursor-pointer"
            >
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
