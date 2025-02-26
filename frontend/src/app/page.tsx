"use client"
import Image from "next/image";
import PropertyCard from "./components/PropertyCard";
// import propertiesData from "./tempProperty.json";
import { useAppSelector } from '../lib/hooks';

export default function Home() {
  const properties = useAppSelector((state) => state.property.properties);
  if (!properties || properties.length === 0) {
    return <p className="flex items-center justify-center text-2xl">Getting Best Properties.</p>;
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
          <main className="flex flex-row flex-wrap gap-8 items-center sm:items-start justify-center">
            {/* <PropertyCard/> */}
            {properties.map((property, index) => (
              <PropertyCard key={index} property={property} />
            ))}
          </main>
          <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Go to nextjs.org →
            </a>
          </footer>
        </div>
      </div>
  );
}
