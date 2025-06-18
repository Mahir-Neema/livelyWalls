"use client";

import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import { Property } from "@/models/Property";

export default function RentPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [popularLocations, setPopularLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Fetch popular locations on mount
  useEffect(() => {
    async function fetchPopularLocations() {
      const cachedPopularLocations = localStorage.getItem("popularLocations");
      if (cachedPopularLocations) {
        setPopularLocations(JSON.parse(cachedPopularLocations));
        setLoadingLocations(false);
        return;
      }
      try {
        const response = await fetch(
          "https://livelywalls.onrender.com/search/popular-places?limit=10",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();
        setPopularLocations(data.data || []);
        localStorage.setItem(
          "popularLocations",
          JSON.stringify(data.data || [])
        );
      } catch (error) {
        console.error("Error fetching popular locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    }

    fetchPopularLocations();
  }, []);

  // Fetch properties when location button is clicked
  async function handleLocationClick(location: string) {
    setSelectedLocation(location);
    try {
      const response = await fetch("https://livelywalls.onrender.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  }

  useEffect(() => {
    if (popularLocations.length > 0) {
      const firstLocation = popularLocations[0];
      setSelectedLocation(firstLocation);
      handleLocationClick(firstLocation);
    }
  }, [popularLocations]);

  return (
    <div className="items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
      {/* Heading */}
      <div className="text-xl font-semibold text-gray-800 px-4 sm:px-8 mt-6 mb-2 text-center">
        Popular Locations
      </div>

      {/* Scrollable Buttons or Skeletons */}
      <div className="w-full overflow-x-auto py-4 px-2">
        <div className="flex justify-center w-max space-x-4 mx-auto">
          {loadingLocations
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-[100px] bg-gray-200 rounded-full animate-pulse"
                />
              ))
            : popularLocations.map((location, index) => (
                <button
                  key={index}
                  className={`whitespace-nowrap px-4 py-1 rounded-full text-gray-700 hover:bg-gray-300 focus:outline-none focus:bg-pink-700 focus:text-white transition duration-300 ease-in-out ${
                    location === selectedLocation
                      ? "bg-pink-700 text-white"
                      : "bg-gray-300"
                  }`}
                  onClick={() => handleLocationClick(location)}
                >
                  {location}
                </button>
              ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="w-full grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen px-8 pt-5 pb-20 gap-16 sm:px-20 py-10">
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {properties.length > 0 ? (
            properties.map((property, index) => (
              <PropertyCard key={index} property={property} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              {loadingLocations
                ? ""
                : "Select a location to view available properties."}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
