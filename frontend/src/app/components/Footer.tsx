"use client";
import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full border-t-2 text-gray-700 px-6 sm:px-16 py-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-bold mb-4">Smiling Bricks</h2>
          <p className="text-sm sm:text-base">
            Simplifying home search for everyone. Verified listings, zero broker
            fees, and a seamless rental experience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>
              <a href="#" className="hover:underline">
                Rentals
              </a>
            </li>
            <li>
              {/* <Link href={`/search?listingType="Flatmate"`}>Flatmates</Link> */}
              <a href="#" className="hover:underline">
                Flatmates
              </a>
            </li>
            <li>
              <Link className="hover:underline" href="/addproperty">
                Post Property
              </Link>
            </li>
            <li>
              <a href="#" className="hover:underline">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Connect with us</h3>
          <div className="flex gap-4 items-center mb-4">
            <a href="#" className="text-blue-600 hover:text-blue-800">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M22 3.1a8.4 8.4 0 0 1-2.36.65A4.18 4.18 0 0 0 21.4 1.6a8.27 8.27 0 0 1-2.6.99A4.14 4.14 0 0 0 15.3.6a4.2 4.2 0 0 0-4.2 4.2c0 .33.04.66.1.97A11.9 11.9 0 0 1 3 2.1a4.22 4.22 0 0 0-.6 2.1 4.2 4.2 0 0 0 1.87 3.5A4.16 4.16 0 0 1 2 7v.05a4.2 4.2 0 0 0 3.37 4.1 4.2 4.2 0 0 1-1.89.07 4.22 4.22 0 0 0 3.92 2.9 8.4 8.4 0 0 1-5.2 1.8A8.7 8.7 0 0 1 2 17.9a11.8 11.8 0 0 0 6.29 1.84c7.55 0 11.68-6.3 11.68-11.76 0-.18 0-.36-.01-.54A8.4 8.4 0 0 0 22 3.1z" />
              </svg>
            </a>
            <a href="#" className="text-blue-500 hover:text-blue-700">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.2c-5.5 0-9.96 4.45-9.96 9.96 0 4.41 3.6 8.07 8.25 8.87v-6.28H8.12v-2.6h2.17V9.71c0-2.15 1.28-3.33 3.23-3.33.94 0 1.92.17 1.92.17v2.1h-1.08c-1.07 0-1.4.66-1.4 1.34v1.6h2.38l-.38 2.6h-2v6.28C18.36 20.07 22 16.41 22 11.99 22 6.5 17.54 2.04 12 2.04z" />
              </svg>
            </a>
            <a href="#" className="text-pink-600 hover:text-pink-800">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.18.06 2.01.25 2.49.42a5.05 5.05 0 0 1 1.78 1.02c.5.5.88 1.1 1.1 1.78.17.48.36 1.31.42 2.5.07 1.24.07 1.64.07 4.84s0 3.6-.07 4.84c-.06 1.18-.25 2.01-.42 2.49a5.04 5.04 0 0 1-1.02 1.78 5.06 5.06 0 0 1-1.78 1.1c-.48.17-1.31.36-2.5.42-1.24.07-1.64.07-4.84.07s-3.6 0-4.84-.07c-1.18-.06-2.01-.25-2.49-.42a5.05 5.05 0 0 1-1.78-1.02 5.06 5.06 0 0 1-1.1-1.78c-.17-.48-.36-1.31-.42-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.84c.06-1.18.25-2.01.42-2.49A5.05 5.05 0 0 1 3.7 2.89a5.06 5.06 0 0 1 1.78-1.1c.48-.17 1.31-.36 2.5-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.16 0-3.53 0-4.77.07-.9.05-1.4.2-1.73.34a3.3 3.3 0 0 0-1.2.77 3.3 3.3 0 0 0-.77 1.2c-.14.33-.29.83-.34 1.73-.07 1.24-.07 1.61-.07 4.77s0 3.53.07 4.77c.05.9.2 1.4.34 1.73.18.45.43.86.77 1.2.34.34.75.59 1.2.77.33.14.83.29 1.73.34 1.24.07 1.61.07 4.77.07s3.53 0 4.77-.07c.9-.05 1.4-.2 1.73-.34.45-.18.86-.43 1.2-.77.34-.34.59-.75.77-1.2.14-.33.29-.83.34-1.73.07-1.24.07-1.61.07-4.77s0-3.53-.07-4.77c-.05-.9-.2-1.4-.34-1.73a3.3 3.3 0 0 0-.77-1.2 3.3 3.3 0 0 0-1.2-.77c-.33-.14-.83-.29-1.73-.34-1.24-.07-1.61-.07-4.77-.07zm0 3.8a5 5 0 1 1 0 10.01A5 5 0 0 1 12 7.8zm0 1.8a3.2 3.2 0 1 0 0 6.41 3.2 3.2 0 0 0 0-6.41zm6.4-.9a1.2 1.2 0 1 1-2.41 0 1.2 1.2 0 0 1 2.41 0z" />
              </svg>
            </a>
          </div>
          <p className="text-sm">Email: contact@smilingbricks.in</p>
          <p className="text-sm">Phone: +91 98XXXXXX98</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Smiling Bricks. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
