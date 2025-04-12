"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { ToWords } from "to-words";
import { useAppSelector } from "@/lib/hooks";

const AddProperty = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [rentInWords, setRentInWords] = useState("Zero Rupees only.");
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formData, setFormData] = useState({
    isBrokerListing: false,
    isAvailable: true,
    isVegetarianPreferred: false,
    isFamilyPreferred: false,
    genderPreference: "Any",
    propertyType: "Flat",
    listingType: "Rent",
    location: "",
    societyName: "",
    area: "",
    city: "",
    bedrooms: 1,
    bathrooms: 1,
    description: "",
    rent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    photoFiles: [] as File[],
    link: "",
    // balconies: 0,
    // amenities: [],
    // areaSqft: 0,
    // photos: [] as string[],
  });

  const router = useRouter();

  const toWords = new ToWords();

  const convertRentToWords = (rent: Number) => {
    if (rent === 0) {
      return "Zero Rupees only.";
    }

    const rentNumber = Number(rent);
    if (isNaN(rentNumber)) {
      return "Invalid Rent Value";
    }
    return toWords.convert(rentNumber, { currency: true });
  };

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
      const newValue =
        type === "number" ||
        name === "bedrooms" ||
        name === "rent" ||
        name === "bathrooms"
          ? Number(value)
          : value;

      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files) {
  //     const fileUrls = Array.from(files).map((file) =>
  //       URL.createObjectURL(file)
  //     );
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       photos: fileUrls,
  //     }));
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files) {
      setFormData((prevData) => ({
        ...prevData,
        photoFiles: Array.from(files),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return alert("You must be logged in to submit a property.");
    }

    // const formDataPayload = new FormData();

    // formDataPayload.append("property", JSON.stringify(formData));

    // for (const [key, value] of Object.entries(formData)) {
    //   if (key !== "photoFiles") {
    //     formDataPayload.append(key, value as string | Blob);
    //   }
    // }

    // if (formData.photoFiles && formData.photoFiles.length > 0) {
    //   formData.photoFiles.forEach((file: File) => {
    //     formDataPayload.append("photoFiles", file);
    //   });
    // }

    setSubmittingForm(true);

    const formDataToSend = new FormData();

    // Add JSON metadata as a single field
    const { photoFiles, ...propertyData } = formData;
    formDataToSend.append("property", JSON.stringify(propertyData));

    // Add each file to the FormData
    photoFiles.forEach((file) => {
      formDataToSend.append("photoFiles", file);
    });

    try {
      const response = await fetch("http://localhost:8080/api/properties/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit the property. Please try again.");
      }
      alert("Property submitted successfully!");
      router.push("/properties");
    } catch (error) {
      console.error("Error submitting property:", error);
      alert("Failed to submit property. Please try again after some time.");
    } finally {
      setSubmittingForm(false);
    }
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

  if (true) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Submitting properties</span>
        </div>
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

        {/* Location and City Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Text */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter location"
            />
          </div>

          {/* City Dropdown */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-700"
            >
              City
            </label>
            <select
              name="city"
              id="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select City</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
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

          {/* Property Links */}
          <div>
            <label
              htmlFor="link"
              className="block text-sm font-semibold text-gray-700"
            >
              Property Link/ Contact No.
            </label>
            <input
              type="text"
              name="link"
              id="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter property link"
            />
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
              {formData.photoFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.photoFiles.map((photo, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(photo)}
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
