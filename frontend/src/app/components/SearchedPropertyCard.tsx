"use client";
import { useRouter } from "next/navigation";
import { Property } from "@/models/Property";

interface PropertyCardProps {
  property: Property;
}

function SearchedPropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    const propertyQuery = encodeURIComponent(JSON.stringify(property));
    router.push(`/property/${property.id}?property=${propertyQuery}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex border border-gray-300 rounded-lg m-4 overflow-hidden shadow-md w-full max-w-2xl cursor-pointer transition-transform duration-300 hover:scale-105"
    >
      {/* Image Section */}
      <div className="w-1/3 h-40 overflow-hidden">
        <img
          src={property.photos?.[0] || "/example3.png"}
          alt="Property"
          className="w-full h-full object-cover"
        />
        <div className="absolute mt-2 px-2 text-white text-xs bg-gray-900 bg-opacity-75 whitespace-nowrap -translate-y-10">
          {property.isBrokerListing ? "+Brokerage" : "Owner's Listing"}
        </div>
      </div>

      {/* Details Section */}
      <div className="w-2/3 p-4 flex flex-col justify-between relative">
        <h3 className="text-lg font-semibold mb-1">
          {property.listingType === "Flatmate"
            ? property.genderPreference.length < 8
              ? `${property.genderPreference} ${property.listingType}`
              : property.listingType
            : `${property.propertyType} for ${property.listingType}`}
        </h3>
        <p className="text-gray-600">{property.location}</p>
        <p className="text-gray-600">
          {property.bedrooms} Beds | {property.bathrooms} Baths
        </p>
        <div className="text-gray-400 text-sm">
          {true && <p>Vegetarian Preferred</p>}
        </div>
        <p className="font-bold text-lg">₹{property.rent}</p>
      </div>
    </div>
  );
}

export default SearchedPropertyCard;
