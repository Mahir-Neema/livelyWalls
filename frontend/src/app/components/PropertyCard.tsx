"use client";

import { useState } from 'react';
import styles from './PropertyCard.module.css'; // You likely don't need this import if fully using Tailwind
import { FaSackDollar } from "react-icons/fa6";
import Link from 'next/link';
import { Property } from '@/models/Property';

interface PropertyCardProps {
  property: Property;
}

function PropertyCard({ property }: PropertyCardProps) {
  const placeholderProperty = {
    id: "example1",
    photos: ["/example1.jpeg"],
    propertyType: "Flat",
    listingType: "Rent",
    genderPreference: "No Restrictions",
    location: "Koramangala",
    rent: 72000,
    bedrooms: 4,
    bathrooms: 3,
    isBrokerListing: true,
  };

  const currentProperty = property || placeholderProperty;
  const [isBrokerageHovered, setBrokerageHovered] = useState(false); // State to track card hover

  return (
    <Link href={`/property/${currentProperty.id}`}>
    <div className="group border border-gray-300 rounded-lg overflow-hidden mb-5 shadow-md w-60 relative transition-transform duration-300 hover:scale-110 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={currentProperty.photos[0]}
          alt="Property"
          className="w-60 h-40 object-cover block filter brightness-75 transition-all duration-300 group-hover:brightness-100 group-hover:opacity-100 transform scale-100"
        />
        {/* Top Text Overlay */}
        <div className="absolute top-2 left-2 px-3 py-1 rounded-3xl bg-gray-900 bg-opacity-75 text-white group-hover:opacity-0 transition-opacity duration-300">
          <h3 className="text-sm font-semibold">
          {
            currentProperty.listingType === "Flatmate" 
              ? (
                  currentProperty.genderPreference.length < 8 
                  ? `${currentProperty.genderPreference} ${currentProperty.listingType}` 
                  : currentProperty.listingType
                )
              : `${currentProperty.propertyType} for ${currentProperty.listingType}`
          }

          </h3>
        </div>

        {/* Broker Listing Icon - Top Right Corner */}
        {currentProperty.isBrokerListing ? (
          <div className="absolute top-2 right-2 p-2 rounded-full text-white bg-gray-900 bg-opacity-75"
            onMouseEnter={() => setBrokerageHovered(true)} // Set hover state to true on mouse enter
            onMouseLeave={() => setBrokerageHovered(false)} // Set hover state to false on mouse leave
          >
            <FaSackDollar size={14} />
            {isBrokerageHovered && (
                <div className="absolute mt-2 px-1 rounded-2xl text-center text-white text-xs -translate-x-12 bg-gray-900 bg-opacity-75 ">
                +Brokerage
                </div>
            )}
          </div>
        ):(
          <div className="absolute bottom-4 left-0 text-sm py-1 opacity-0 bg-gray-900 bg-opacity-50 text-white text-center group-hover:opacity-100 transition-opacity duration-300 w-full">Owner's Listing</div>
        )}

        {/* Bottom Text Overlay - Centered text, Transparent background, Hover hide */}
        <div className="absolute bottom-0 left-0 p-4 text-white text-center group-hover:opacity-0 transition-opacity duration-300 w-full">
          <p className="text-sm mb-1">
            {currentProperty.location}
          </p>
          <p className="text-sm mb-1">
            {currentProperty.bedrooms} Beds | {currentProperty.bathrooms} Baths
          </p>
          <p className="font-bold text-sm">
            Rent: ₹{currentProperty.rent}
            {currentProperty.listingType === "Flatmate" ? "/\Room" : ""}
          </p>
        </div>
      </div>
    </div>
    </Link>
  );
}

export default PropertyCard;