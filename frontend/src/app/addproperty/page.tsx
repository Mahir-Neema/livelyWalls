"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const AddProperty = () => {
  const [formData, setFormData] = useState({
    ownerID: "",
    isOwnerListing: false,
    isBrokerListing: false,
    isAvailable: true,
    isVegetarianPreferred: false,
    isFamilyPreferred: false,
    genderPreference: "Any",
    propertyType: "Flat",
    listingType: "Rent",
    societyName: "",
    streetAddress: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 0,
    balconies: 0,
    amenities: [],
    description: "",
    rent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    leaseTerm: "1 year",
    photos: [] as File[],
    distancesFromOffices: {} as Record<string, number>,
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prevData) => ({
        ...prevData,
        photos: Array.from(files), // Convert FileList to an array
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    router.push("/properties"); // Redirect after submission
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-500 mb-4 hover:underline"
      >
        <IoArrowBack className="mr-2" />
        Back to Listings
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Property</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owner ID */}
          <div>
            <label htmlFor="ownerID" className="block text-sm font-semibold text-gray-700">
              Owner ID
            </label>
            <input
              type="text"
              name="ownerID"
              id="ownerID"
              value={formData.ownerID}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Rent */}
          <div>
            <label htmlFor="rent" className="block text-sm font-semibold text-gray-700">
              Rent
            </label>
            <input
              type="number"
              name="rent"
              id="rent"
              value={formData.rent}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Two-column layout continues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-semibold text-gray-700">
              Property Type
            </label>
            <select
              name="propertyType"
              id="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Flat">Flat</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={1}
            />
          </div>
        </div>

        {/* Single Column for Other Fields */}
        <div className="grid grid-cols-1 gap-6">
          {/* Is Vegetarian Preferred */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isVegetarianPreferred"
              checked={formData.isVegetarianPreferred}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="isVegetarianPreferred" className="text-sm text-gray-700">
              Vegetarian Preferred
            </label>
          </div>

          {/* Is Family Preferred */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isFamilyPreferred"
              checked={formData.isFamilyPreferred}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="isFamilyPreferred" className="text-sm text-gray-700">
              Family Preferred
            </label>
          </div>

          {/* Gender Preference */}
          <div>
            <label htmlFor="genderPreference" className="block text-sm font-semibold text-gray-700">
              Gender Preference
            </label>
            <select
              name="genderPreference"
              id="genderPreference"
              value={formData.genderPreference}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Property Photos */}
          <div>
            <label htmlFor="photos" className="block text-sm font-semibold text-gray-700">
              Photos
            </label>
            <input
              type="file"
              name="photos"
              id="photos"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition"
          >
            Submit Property
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
