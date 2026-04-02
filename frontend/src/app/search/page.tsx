"use client";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useState, useEffect, Suspense } from "react";
import SearchedPropertyCard from "../components/SearchedPropertyCard";
import Toggle from "../components/Toggle"; // Added Toggle import
import { setSearchedProperties } from "@/lib/features/property/propertySlice";

const SearchPageContent = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const location = searchParams.get("location");
  const listingType = searchParams.get("listingType");
  const searchedProperties =
    useAppSelector((state) => state.property.searchedProperties) || [];
  const [loading, setLoading] = useState(searchedProperties.length === 0);
  const [isNoBroker, setIsNoBroker] = useState(false);

  const filteredProperties = isNoBroker
    ? searchedProperties.filter((property) => !property.isBrokerListing)
    : searchedProperties;

  useEffect(() => {
    const fetchSearchedLocations = async () => {
      try {
        // const body = JSON.stringify({ location: location });
        if (location) {
          var body = JSON.stringify({ location: location });
        } else if (listingType) {
          var body = JSON.stringify({ listingType: listingType });
        } else {
          setLoading(false);
          return;
        }
        console.log("Body:", body);

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

    if (location || listingType) {
      fetchSearchedLocations();
    }
  }, [location, listingType]);

  if (loading) {
    return (
      <p className="text-center text-2xl mt-5">
        Searching {location ? location : listingType} best properties....
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6"> {/** updated layout */}
        <h1 className="text-xl font-semibold text-gray-800">
          {filteredProperties.length} properties found for {location}
        </h1>

        <Toggle
          id="no-broker"
          label="No brokerage"
          checked={isNoBroker}
          onChange={() => setIsNoBroker(!isNoBroker)}
        />
      </div>

      <main className="justify-items-center">
        {filteredProperties.map((property, index) => (
          <SearchedPropertyCard key={index} property={property} />
        ))}
      </main>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense
      fallback={<p className="text-center text-2xl mt-5">Loading...</p>}
    >
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;
