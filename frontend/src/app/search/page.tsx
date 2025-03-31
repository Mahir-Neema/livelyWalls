"use client";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useState, useEffect } from "react";
import SearchedPropertyCard from "../components/SearchedPropertyCard";
import { setSearchedProperties } from "@/lib/features/property/propertySlice";

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const location = searchParams.get("location");
  const searchedProperties =
    useAppSelector((state) => state.property.searchedProperties) || [];
  const [loading, setLoading] = useState(searchedProperties.length === 0);

  useEffect(() => {
    const fetchSearchedLocations = async () => {
      try {
        const body = JSON.stringify({ location: location });

        const response = await fetch(
          "https://livelywalls.onrender.com/search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const reponseData = await response.json();
        dispatch(setSearchedProperties(reponseData.data));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    if (location) {
      fetchSearchedLocations();
    }
  }, [location]);

  if (loading) {
    return (
      <p className="text-center text-2xl mt-5">
        Searching {location} best properties....
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Searching for:{" "}
        <span className="text-indigo-600">{location || "all locations"}</span>
      </h1>

      <main className="justify-items-center">
        {searchedProperties.map((property, index) => (
          <SearchedPropertyCard key={index} property={property} />
        ))}
      </main>
    </div>
  );
};

export default SearchPage;
