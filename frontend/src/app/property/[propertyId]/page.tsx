"use client";

import { useSearchParams } from "next/navigation";

function PropertyDetails() {
  const searchParams = useSearchParams();
  const property = searchParams.get("property");

  const propertyData = property ? JSON.parse(property) : null;

  if (!propertyData)
    return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white overflow-hidden">
        <img
          src={propertyData.photos[0]}
          alt="Property Image"
          className="w-full h-72 object-cover"
        />
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">
            {propertyData.propertyType} for {propertyData.listingType}
          </h1>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Location:</span> {propertyData.location}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Rent:</span> ₹{propertyData.rent}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Beds:</span> {propertyData.bedrooms}{" "}
            | <span className="font-semibold">Baths:</span> {propertyData.bathrooms}
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
