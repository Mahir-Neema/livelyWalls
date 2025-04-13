"use client";
import Image from "next/image";
import PropertyCard from "./components/PropertyCard";
// import propertiesData from "./tempProperty.json";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { useEffect, useState } from "react";
import { setProperties } from "@/lib/features/property/propertySlice";

async function getProperties() {
  const res = await fetch(
    "https://livelywalls.onrender.com/api/properties/top",
    {
      next: { revalidate: 86400 },
    }
  );
  return res.json();
}

export default function Home() {
  // const properties = useAppSelector((state) => state.property.properties);
  // if (!properties || properties.length === 0) {
  //   return <p className="flex items-center justify-center text-2xl">Getting Best Properties.</p>;
  // }
  const dispatch = useAppDispatch();
  const storedProperties =
    useAppSelector((state) => state.property.properties) || [];
  const [loading, setLoading] = useState(storedProperties.length === 0);

  useEffect(() => {
    async function fetchAndStoreProperties() {
      if (storedProperties.length === 0) {
        setLoading(true);
        const properties = await getProperties();
        dispatch(setProperties(properties.data));
        setLoading(false);
      }
    }

    fetchAndStoreProperties();
  }, [dispatch, storedProperties.length]);

  const reviews = [
    {
      name: "Aditya",
      review:
        "Found my dream flat in Koramangala within a day. SmilingBricks is a game-changer!",
      rating: 5,
    },
    {
      name: "Aryan",
      review:
        "Loved how easy it was to find a verified, non-broker listing in HSR. Super smooth process!",
      rating: 4,
    },
    {
      name: "Mohit",
      review:
        "Great variety, real photos, and no hidden surprises. SmilingBricks made renting stress-free!",
      rating: 5,
    },
  ];

  if (loading || storedProperties.length === 0) {
    return (
      <div className="mt-16">
        <p className="text-center text-2xl">Getting Best Properties...</p>
        <div className="flex items-center justify-center">
          <Image
            src="/logo2.png"
            alt="getting properties"
            width={200}
            height={150}
            className="mt-7 animate-bounce"
          />
        </div>
      </div>
    );
  }

  return (
    <div className=" items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
      <div className="text-4xl text-center px-8 py-6">
        Simplifying Home Search for Everyone!
      </div>
      <div className="text-2xl text-center border-b-1 border-gray-300 pb-4">
        🍁 Properties from top cities in India
      </div>

      <div className="**w-full** grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen px-8 pt-5 pb-20 gap-16 sm:px-20 py-10">
        {" "}
        {/* Added w-full to outer div */}
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {/* <PropertyCard/> */}
          {storedProperties.map((property, index) => (
            <PropertyCard key={index} property={property} />
          ))}
        </main>
        {/* reviews */}
        <div className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="relative mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-center">
              See the Smiles We’ve Made
            </h1>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-7">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border">
                {/* User Info */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white text-lg font-bold">
                    {review.name[0]}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-base sm:text-lg font-bold">
                      {review.name}
                    </h2>
                    <div className="flex text-yellow-500">
                      {Array(review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          >
                            <path d="M12 17.75l-6.517 3.695 1.24-7.233L.92 9.511l7.273-1.057L12 1.875l3.808 6.579 7.272 1.057-5.804 4.701 1.239 7.233z" />
                          </svg>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-600 text-sm sm:text-base">
                  {review.review}
                </p>
              </div>
            ))}
          </div>
        </div>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
    </div>
  );
}
