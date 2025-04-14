"use client";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaSquareXTwitter, FaFacebook } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="w-full border-t-2 text-gray-700 px-6 sm:px-16 py-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-bold mb-4">Smiling Bricks</h2>
          <p className="text-sm sm:text-base">
            Simplifying home search for everyone. Latest listings, zero broker
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
          <div className="flex gap-4 items-center mb-4 text-xl">
            <a href="#" className="text-blue-600 hover:text-blue-800">
              <FaFacebook />
            </a>
            <a href="#" className="text-Black hover:text-gray-800">
              <FaSquareXTwitter />
            </a>
            <a
              href="https://github.com/Mahir-Neema/livelyWalls"
              target="#"
              className="text-black hover:text-gray-800"
            >
              <FaGithub />
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
