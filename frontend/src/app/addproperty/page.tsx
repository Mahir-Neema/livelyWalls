"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { ToWords } from "to-words";
import { useAppSelector } from "@/lib/hooks";

const AddProperty = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [rentInWords, setRentInWords] = useState("Zero Rupees only.");
  const [formData, setFormData] = useState({
    isOwnerListing: false,
    isBrokerListing: false,
    isAvailable: true,
    isVegetarianPreferred: false,
    isFamilyPreferred: false,
    genderPreference: "Any",
    propertyType: "Flat",
    listingType: "Rent", // Default to "Rent"
    societyName: "",
    streetAddress: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: 1, // Default to 1 BHK
    bathrooms: 1, // Default to 1 bathroom
    areaSqft: 0,
    balconies: 0,
    amenities: [],
    description: "",
    rent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    leaseTerm: "1 year",
    photos: [] as string[], // Updated for URLs (string[])
    distancesFromOffices: {} as Record<string, number>,
  });

  const router = useRouter();

  const toWords = new ToWords();

  // This function will convert rent into words
  const convertRentToWords = (rent: number | string) => {
    if (rent === "" || rent === 0) {
      return "Zero Rupees only.";
    }
    // Ensure that the rent is a valid number
    const rentNumber = Number(rent);
    if (isNaN(rentNumber)) {
      return "Invalid Rent Value"; // Fallback message for invalid input
    }
    return toWords.convert(rentNumber, { currency: true });
  };

  // Update rentInWords whenever rent changes
  useEffect(() => {
    setRentInWords(convertRentToWords(formData.rent));
  }, [formData.rent]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
      const fileUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setFormData((prevData) => ({
        ...prevData,
        photos: fileUrls,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    router.push("/properties"); // Redirect after submission
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">
          You must be logged in to add a property.
        </h1>
      </div>
    );
  }

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
        {/* Rent and Property Type in one row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rent */}
          <div>
            <label
              htmlFor="rent"
              className="block text-sm font-semibold text-gray-700"
            >
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

          {/* Property Type */}
          <div>
            <label
              htmlFor="propertyType"
              className="block text-sm font-semibold text-gray-700"
            >
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
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Duplex">Duplex</option>
            </select>
          </div>
        </div>

        {/* Rent in words display */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-400">{rentInWords}</p>
        </div>

        {/* Description in full width */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={4}
          />
        </div>

        {/* Other Fields */}
        <div className="grid grid-cols-1 gap-6">
          {/* Listing Type */}
          <div>
            <label
              htmlFor="listingType"
              className="block text-sm font-semibold text-gray-700"
            >
              Listing Type
            </label>
            <select
              name="listingType"
              id="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Rent">Rent</option>
              <option value="Sale">Sale</option>
              <option value="Flatmate">Flatmate</option>
            </select>
          </div>

          {/* Bedrooms (BHK) */}
          <div>
            <label
              htmlFor="bedrooms"
              className="block text-sm font-semibold text-gray-700"
            >
              Bedrooms (BHK)
            </label>
            <select
              name="bedrooms"
              id="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={1}>1 BHK</option>
              <option value={2}>2 BHK</option>
              <option value={3}>3 BHK</option>
              <option value={4}>4 BHK</option>
              <option value={5}>5 BHK</option>
              <option value={6}>6 BHK</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label
              htmlFor="bathrooms"
              className="block text-sm font-semibold text-gray-700"
            >
              Bathrooms
            </label>
            <select
              name="bathrooms"
              id="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={1}>1 Bathroom</option>
              <option value={2}>2 Bathrooms</option>
              <option value={3}>3 Bathrooms</option>
              <option value={4}>4 Bathrooms</option>
              <option value={5}>5 Bathrooms</option>
            </select>
          </div>

          {/* Is Vegetarian Preferred */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isVegetarianPreferred"
              checked={formData.isVegetarianPreferred}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="isVegetarianPreferred"
              className="text-sm text-gray-700"
            >
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
            <label
              htmlFor="isFamilyPreferred"
              className="text-sm text-gray-700"
            >
              Family Preferred
            </label>
          </div>

          {/* Gender Preference */}
          <div>
            <label
              htmlFor="genderPreference"
              className="block text-sm font-semibold text-gray-700"
            >
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
            <label
              htmlFor="photos"
              className="block text-sm font-semibold text-gray-700"
            >
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
            <div className="mt-4">
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Property Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
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
