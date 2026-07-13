"use client";

import ImageCarousel from "@/app/components/ImageCarousel";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePlusCircle,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineShieldCheck,
  HiOutlineTranslate,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineSparkles
} from "react-icons/hi";
import { Property } from "@/models/Property";

// Helper for Amenities with Icons
const AmenityIcon = ({ name }: { name: string }) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("parking")) return <HiOutlinePlusCircle className="w-4 h-4" />;
  if (nameLower.includes("wifi") || nameLower.includes("internet")) return <HiOutlineSparkles className="w-4 h-4" />;
  if (nameLower.includes("gym")) return <HiOutlineSparkles className="w-4 h-4" />;
  if (nameLower.includes("security")) return <HiOutlineShieldCheck className="w-4 h-4" />;
  return <HiOutlineSparkles className="w-4 h-4" />;
};

function PropertyDetails() {
  const searchParams = useSearchParams();
  const property = searchParams.get("property");
  const propertyData: Property | null = property ? JSON.parse(property) : null;
  const propertyId = propertyData?.id || null;

  useEffect(() => {
    if (propertyId) {
      const viewedKey = `viewed_property_${propertyId}`;
      const hasViewed = localStorage.getItem(viewedKey);
      if (!hasViewed) {
        const updateViewCount = async () => {
          try {
            await fetch(
              `https://livelywalls.onrender.com/api/properties/${propertyId}/view`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              }
            );
            localStorage.setItem(viewedKey, "true");
          } catch (error) {
            console.error("Failed to update view count", error);
          }
        };
        updateViewCount();
      }
    }
  }, [propertyId]);

  if (!propertyData)
    return <p className="text-center mt-20 text-gray-500 text-sm animate-pulse">Navigating to your next home...</p>;

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Hero Section - Balanced Width Carousel */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
          <ImageCarousel
            slides={propertyData.photos?.length > 0 ? propertyData.photos : ["/example3.png"]}
            className="h-[300px] md:h-[400px]"
          />

          {/* Overlay Badges */}
          <div className="absolute top-4 left-4 flex space-x-2 z-10">
            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-md shadow-sm border border-gray-100">
              {propertyData.isBrokerListing ? "Broker Meta" : "Direct Owner"}
            </span>
            {(propertyData.views ?? 0) > 20 && (
              <span className="px-3 py-1.5 bg-pink-600/95 backdrop-blur-sm text-white text-xs font-semibold rounded-md shadow-sm flex items-center">
                <HiOutlineSparkles className="w-3 h-3 mr-1" />
                Popular
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[65%] space-y-8">

            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-blue-700 font-semibold text-xs bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                <HiOutlineHome className="w-3.5 h-3.5" />
                <span>{propertyData.propertyType} • {propertyData.listingType}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {propertyData.societyName || "Premium Residence"}
              </h1>
              <div className="flex items-center text-gray-500 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 mr-1.5 text-red-400" />
                <span className="font-medium">{propertyData.location}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span>{propertyData.streetAddress}</span>
              </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Monthly Rent", value: `₹${propertyData.rent.toLocaleString()}`, icon: HiOutlineCurrencyRupee, color: "text-blue-600" },
                { label: "Deposit", value: `₹${propertyData.securityDeposit?.toLocaleString() || "N/A"}`, icon: HiOutlineShieldCheck, color: "text-green-600" },
                { label: "Configuration", value: `${propertyData.bedrooms} BHK`, icon: HiOutlineHome, color: "text-purple-600" },
                { label: "Total Area", value: `${propertyData.areaSqft || 1200} sqft`, icon: HiOutlineSparkles, color: "text-pink-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-xs font-medium text-gray-500 mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">About this home</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {propertyData.description || "Looking for a premium living experience? This property offers a perfect blend of comfort and style. Nestled in a prime location, it features modern amenities and a vibrant neighborhood. Ideal for professionals and families alike."}
              </p>

              {/* Preferences Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {propertyData.isVegetarianPreferred && (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100">
                    🥦 Vegetarian Preferred
                  </span>
                )}
                {propertyData.isFamilyPreferred && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
                    👨‍👩‍👧‍👦 Family Preferred
                  </span>
                )}
                {propertyData.genderPreference !== "Any" && (
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-100">
                    👤 {propertyData.genderPreference} Only
                  </span>
                )}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(propertyData.amenities?.length > 0 ? propertyData.amenities : ["24/7 Water Supply", "Power Backup", "Security", "Parking"]).map((amenity, i) => (
                  <div key={i} className="flex items-center space-x-2.5 p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="text-blue-600">
                      <AmenityIcon name={amenity} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Proximity Hub */}
            {propertyData.distancesFromOffices && Object.keys(propertyData.distancesFromOffices).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Nearby Commute</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(propertyData.distancesFromOffices).map(([office, dist], i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-2.5">
                        <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{office}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {dist} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="w-full lg:w-[35%]">
            <div className="sticky top-24 space-y-6">

              {/* Contact Information Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="space-y-1 mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Listing Price</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-gray-900">₹{propertyData.rent.toLocaleString()}</span>
                    <span className="text-sm font-medium text-gray-500">/mo</span>
                  </div>
                  <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                    <HiOutlineClock className="w-3 h-3 mr-1" />
                    Competitive for {propertyData.location}
                  </p>
                </div>

                <div className="space-y-4">
                  {propertyData.link && propertyData.link.length > 0 ? (
                    /^\+?\d{10,15}$/.test(propertyData.link) ? (
                      <div className="space-y-3">
                        <div className="text-center py-3 bg-gray-50 rounded-xl border border-gray-200">
                           <p className="text-xs text-gray-500 mb-0.5">Contact Number</p>
                           <p className="text-lg font-bold text-gray-900">{propertyData.link}</p>
                        </div>
                        <a
                          href={`tel:${propertyData.link}`}
                          className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Call Direct Owner
                        </a>
                      </div>
                    ) : (
                      <a
                        href={propertyData.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Visit Source Listing
                      </a>
                    )
                  ) : (
                    <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed">
                      Contact Info Unavailable
                    </button>
                  )}

                  <div className="pt-4 border-t border-gray-100 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      <span className="font-bold text-gray-900">{propertyData.views || 0}</span> views this week
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Tip */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <div className="flex items-center space-x-1.5 text-amber-800 text-xs font-bold mb-1.5">
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  <span>Safety Tip</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Never pay advance security deposits before visiting the property in person and verifying documents.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 flex items-center justify-between pb-safe">
        <div>
          <p className="text-xs text-gray-500">Rent per month</p>
          <p className="text-xl font-bold text-gray-900">₹{propertyData.rent.toLocaleString()}</p>
        </div>
        <a
          href={propertyData.link && /^\+?\d{10,15}$/.test(propertyData.link) ? `tel:${propertyData.link}` : (propertyData.link || "#")}
          className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg active:scale-95 transition-transform"
        >
          Contact
        </a>
      </div>
    </div>
  );
}

export default PropertyDetails;