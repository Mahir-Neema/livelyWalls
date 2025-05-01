"use client";

import ImageCarousel from "@/app/components/ImageCarousel";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function PropertyDetails() {
  const searchParams = useSearchParams();
  const property = searchParams.get("property");

  const propertyData = property ? JSON.parse(property) : null;
  const propertyId = propertyData?.id || null;

  useEffect(() => {
    if (propertyId) {
      const viewedKey = `viewed_property_${propertyId}`;
      const hasViewed = localStorage.getItem(viewedKey);
      if (!hasViewed) {
        const updateViewCount = async () => {
          const res = await fetch(
            `https://livelywalls.onrender.com/api/properties/${propertyId}/view`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!res.ok) {
            console.error("Failed to update view count");
          }
          localStorage.setItem(viewedKey, "true");
        };
        updateViewCount();
      }
    }
  }, [propertyId]);

  if (!propertyData)
    return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
      <div className="bg-gray-50 overflow-hidden flex flex-col sm:flex-row gap-8">
        {/* Left: Image Carousel */}
        {propertyData.photos?.length > 0 ? (
          <div className="sm:w-1/2 mt-0 md:mt-6">
            <ImageCarousel slides={propertyData.photos} />
            {propertyData.views > 0 && (
              <div className="flex justify-end mt-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-purple-900 dark:text-purple-300">
                  views: {propertyData.views}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="sm:w-1/2 mt-0 md:mt-6">
            <ImageCarousel slides={["/example3.png"]} />
          </div>
        )}

        {/* Right: Property Details */}
        <div className="sm:w-1/2 p-6 flex flex-col justify-between bg-gray-50 ">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {propertyData.listingType === "Flatmate"
              ? propertyData.genderPreference?.length < 8
                ? `${propertyData.genderPreference} ${propertyData.listingType}`
                : propertyData.listingType
              : `${propertyData.propertyType} for ${propertyData.listingType}`}
            {": "}
            {propertyData.isBrokerListing ? "Broker Listing" : "Owner Listing"}
          </h1>

          <div className="text-gray-700 mb-4">
            <p className="mb-2 flex justify-between items-center">
              <span>
                <span className="font-semibold text-gray-900">Location:</span>{" "}
                {propertyData.location}
              </span>
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-900">Rent:</span> ₹
              {propertyData.rent}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-900">Beds:</span>{" "}
              {propertyData.bedrooms} |{" "}
              <span className="font-semibold text-gray-900">Baths:</span>{" "}
              {propertyData.bathrooms}
            </p>
            {propertyData.isVegetarianPreferred ||
            propertyData.isFamilyPreferred ? (
              <p className="mb-2">
                <span className="font-semibold text-gray-900">
                  Preference:{" "}
                </span>
                {propertyData.isVegetarianPreferred && <span>Vegetarian </span>}
                {propertyData.isFamilyPreferred && <span>Family</span>}
              </p>
            ) : null}

            {/* Description */}
            {propertyData.description?.length > 0 ? (
              <div>
                <span className="text-xl font-semibold text-gray-900 mb-2">
                  Description:{" "}
                </span>
                <span className="text-gray-700">
                  {propertyData.description}
                </span>
              </div>
            ) : null}
          </div>

          {/* Action button (example) */}
          {propertyData.link?.length > 0 ? (
            <div className="mt-6 text-center">
              <a
                href={propertyData.link}
                target="#"
                className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
              >
                Contact here
              </a>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
