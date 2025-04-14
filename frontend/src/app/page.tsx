import PropertyCard from "./components/PropertyCard";
import { Property } from "@/models/Property";

async function getProperties() {
  const res = await fetch(
    "https://livelywalls.onrender.com/api/properties/top",
    {
      next: { revalidate: 86400 }, // Cache and revalidate every 24 hours
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch properties");
  }

  const data = await res.json();
  return data.data || [];
}

export default async function Home() {
  const properties = await getProperties();

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

  return (
    <div className="items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
      <div className="text-4xl text-center px-8 py-6">
        Simplifying Home Search for Everyone!
      </div>
      <div className="text-2xl text-center border-b-1 border-gray-300 pb-4">
        🍁 Properties from top cities in India
      </div>

      <div className="w-full grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen px-8 pt-5 pb-20 gap-16 sm:px-20 py-10">
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {properties.map((property: Property, index: number) => (
            <PropertyCard key={index} property={property} />
          ))}
        </main>

        {/* Reviews */}
        <div className="p-4 sm:p-6">
          <div className="relative mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-center">
              See the Smiles We’ve Made
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-5">
            {reviews.map((review, index) => (
              <div
                className="bg-white shadow-lg rounded-lg p-4 w-full max-w-[300px]"
                key={index}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center text-lg font-bold">
                    {review.name[0]}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-base font-semibold">{review.name}</h2>
                    <div className="flex text-yellow-500">
                      {Array(review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                          >
                            <path d="M12 17.75l-6.517 3.695 1.24-7.233L.92 9.511l7.273-1.057L12 1.875l3.808 6.579 7.272 1.057-5.804 4.701 1.239 7.233z" />
                          </svg>
                        ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
