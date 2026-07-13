"use client";
import { useRouter } from "next/navigation";
import { Property } from "@/models/Property";
import { FaExternalLinkAlt } from "react-icons/fa";

interface PropertyCardProps {
  property: Property;
}

const SOURCE_LABELS: Record<string, string> = {
  platform: "SmilingBricks",
  magicbricks: "MagicBricks",
  nobroker: "NoBroker",
  housing: "Housing.com",
  kots: "Kots",
  rentmystay: "RentMyStay",
  facebook: "Facebook",
};

function SearchedPropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    const propertyQuery = encodeURIComponent(JSON.stringify(property));
    router.push(`/property/${property.id}?property=${propertyQuery}`);
  };

  const sourceLabel = property.source
    ? SOURCE_LABELS[property.source] || property.source
    : null;
  const isPlatform = property.source === "platform";

  return (
    <div
      onClick={handleCardClick}
      className="flex border border-gray-100 rounded-2xl m-4 overflow-hidden shadow-sm w-full max-w-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-white group relative"
    >
      {/* Image Section */}
      <div className="w-1/3 h-48 overflow-hidden relative rounded-l-2xl">
        <img
          src={property.photos?.[0] || "/example3.png"}
          alt="Property"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-2 left-2 px-2 py-1 text-white text-[10px] font-bold uppercase tracking-wider bg-gray-900/60 backdrop-blur-md rounded-md">
          {property.isBrokerListing ? "Broker Meta" : "Direct Owner"}
        </div>
        {/* Source badge */}
        {sourceLabel && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md ${
              isPlatform
                ? "bg-purple-600/80 text-white"
                : "bg-orange-500/80 text-white"
            }`}
          >
            {sourceLabel}
            {!isPlatform && property.sourceUrl && (
              <FaExternalLinkAlt className="inline ml-1 w-2.5 h-2.5" />
            )}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="w-2/3 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {property.title || (property.listingType === "Flatmate"
              ? property.genderPreference?.length < 8
                ? `${property.genderPreference} ${property.listingType}`
                : property.listingType
              : `${property.propertyType} for ${property.listingType}`)}
          </h3>
          <p className="text-gray-500 font-medium flex items-center text-sm">
            <span className="truncate">{property.location}</span>
          </p>
          {property.furnishing && (
            <p className="text-xs text-gray-400 mt-1 capitalize">{property.furnishing}</p>
          )}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span className="font-bold text-gray-700">{property.bedrooms}</span>
              <span>BHK</span>
            </div>
            {property.bathrooms > 0 && (
              <div className="flex items-center space-x-1 text-gray-400 text-sm border-l pl-4 border-gray-100">
                 <span className="font-bold text-gray-700">{property.bathrooms}</span>
                 <span>Bath</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-4">
          <p className="font-extrabold text-2xl text-blue-600">
            ₹{property.rent.toLocaleString()}
            <span className="text-sm font-medium text-gray-400 ml-1">/mo</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SearchedPropertyCard;
