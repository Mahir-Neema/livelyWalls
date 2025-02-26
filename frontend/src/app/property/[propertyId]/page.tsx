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
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
      <div className="bg-gray-50 overflow-hidden flex flex-col sm:flex-row gap-8">
        {/* Left: Image Carousel */}
        <div className="sm:w-1/2">
          <ImageCarousel slides={propertyData.photos} />
        </div>

        {/* Right: Property Details */}
        <div className="sm:w-1/2 p-6 flex flex-col justify-between bg-gray-50 ">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {propertyData.listingType === "Flatmate"
              ? propertyData.genderPreference.length < 8
                ? `${propertyData.genderPreference} ${propertyData.listingType}`
                : propertyData.listingType
              : `${propertyData.propertyType} for ${propertyData.listingType}`}
          </h1>

          <div className="text-gray-700 mb-4">
            <p className="mb-2">
              <span className="font-semibold text-gray-900">Location:</span> {propertyData.location}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-900">Rent:</span> ₹{propertyData.rent}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-900">Beds:</span> {propertyData.bedrooms} |{" "}
              <span className="font-semibold text-gray-900">Baths:</span> {propertyData.bathrooms}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-900">Listing Type:</span>{" "}
              {propertyData.isBrokerListing ? "Broker Listing" : "Owner Listing"}
            </p>
            {propertyData.isVegetarianPreferred || propertyData.isFamilyPreferred ? (
              <p className="mb-2">
                <span className="font-semibold text-gray-900">Preference: </span>
                {propertyData.isVegetarianPreferred && <span>Vegetarian </span>}
                {propertyData.isFamilyPreferred && <span>Family</span>}
              </p>
            ):null}
          </div>

          {/* Action button (example) */}
          <div className="mt-6 text-center">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300">
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
