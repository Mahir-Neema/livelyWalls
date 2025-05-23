import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import StoreProvider from "./StoreProvider";
import propertiesData from "./tempProperty.json";
import Footer from "./components/Footer";
// import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmilingBricks",
  description: "Find Your Dream Home",
  icons: {
    icon: "/titleLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)] background-white`}
      >
        {/* <GoogleOAuthProvider clientId="809654090015-6cf72btgha6q9jqmr5mebtmrr56hc58d.apps.googleusercontent.com"> */}
        <StoreProvider>
          {/* initialProperties={propertiesData} */}
          <Navbar />
          {children}
          <Footer />
        </StoreProvider>
        {/* </GoogleOAuthProvider> */}
      </body>
    </html>
  );
}
