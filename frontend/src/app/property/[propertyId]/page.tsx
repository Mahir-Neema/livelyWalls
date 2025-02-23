"use client";

import ImageCarousel from "@/app/components/ImageCarousel";
import { useSearchParams } from "next/navigation";

function PropertyDetails() {
  const searchParams = useSearchParams();
  const property = searchParams.get("property");

  const propertyData = property ? JSON.parse(property) : null;

  if (!propertyData)
    return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="bg-white overflow-hidden">
        {/* Render the carousel with property images */}
        <ImageCarousel slides={propertyData.photos} />

        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">
            {propertyData.listingType === "Flatmate"
              ? propertyData.genderPreference.length < 8
                ? `${propertyData.genderPreference} ${propertyData.listingType}`
                : propertyData.listingType
              : `${propertyData.propertyType} for ${propertyData.listingType}`}
          </h1>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Location:</span>{" "}
            {propertyData.location}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Rent:</span> ₹{propertyData.rent}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Beds:</span> {propertyData.bedrooms}{" "}
            | <span className="font-semibold">Baths:</span>{" "}
            {propertyData.bathrooms}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Listing:</span>{" "}
            {propertyData.isBrokerListing ? "Broker Listing" : "Owner Listing"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
