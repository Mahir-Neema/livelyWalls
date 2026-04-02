"use client";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useState, useEffect, Suspense } from "react";
import SearchedPropertyCard from "../components/SearchedPropertyCard";
import Toggle from "../components/Toggle"; // Added Toggle import
import NearbySuggestions from "../components/NearbySuggestions"; // Added AI component
import { setSearchedProperties } from "@/lib/features/property/propertySlice";
import { useRouter } from "next/navigation";

const SearchPageContent = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get("location");
  const listingType = searchParams.get("listingType");
  const searchedProperties =
    useAppSelector((state) => state.property.searchedProperties) || [];
  const [loading, setLoading] = useState(searchedProperties.length === 0);
  const [isNoBroker, setIsNoBroker] = useState(false);

  // AI Suggestions state
  const [nearbySuggestions, setNearbySuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredProperties = isNoBroker
    ? searchedProperties.filter((property) => !property.isBrokerListing)
    : searchedProperties;

  useEffect(() => {
    const fetchSearchedLocations = async () => {
      try {
        if (!location && !listingType) {
          setLoading(false);
          return;
        }

        var body = location
          ? JSON.stringify({ location: location })
          : JSON.stringify({ listingType: listingType });

        // console.log("Body:", body);

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

  // Fetch AI Suggestions
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      if (!location) return;

      setIsAiLoading(true);
      try {
        const response = await fetch(
          `https://livelywalls.onrender.com/ai/nearby-locations?location=${encodeURIComponent(location)}`
        );
        if (response.ok) {
          const data = await response.json();
          setNearbySuggestions(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching AI suggestions:", error);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiSuggestions();
  }, [location]);

  const handleSuggestionClick = (newLoc: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", newLoc);
    router.push(`/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <p className="text-center text-2xl mt-5">
        Searching {location ? location : listingType} best properties....
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header section with status and search info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Explore {location || listingType}
          </h1>
          <p className="text-gray-500 font-medium">
            {filteredProperties.length} handpicked properties found
          </p>
        </div>

        <div className="bg-gray-50 px-4 py-2 rounded-2xl flex items-center shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <Toggle
            id="no-broker"
            label="Owners only (No brokerage)"
            checked={isNoBroker}
            onChange={() => setIsNoBroker(!isNoBroker)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <main className="w-full lg:w-3/4 flex flex-col items-center order-2 lg:order-1">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property, index) => (
              <SearchedPropertyCard key={index} property={property} />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl w-full border-2 border-dashed border-gray-200">
              <p className="text-xl font-semibold text-gray-500">No properties found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or checking nearby areas.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar for AI Suggestions */}
        <aside className="w-full lg:w-1/4 order-1 lg:order-2">
          <div className="sticky top-24">
            <NearbySuggestions
              locations={nearbySuggestions}
              isLoading={isAiLoading}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        </aside>
      </div>
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
