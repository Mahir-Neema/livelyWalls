// src/models/Property.ts
export interface Property {
  id: string;
  ownerId: string;
  isOwnerListing: boolean;
  isBrokerListing: boolean;
  isAvailable: boolean;
  isVegetarianPreferred: boolean;
  isFamilyPreferred: boolean;
  genderPreference: string; // "Male", "Female", "Any"
  propertyType: string; // "Flat", "Apartment", "House", "Studio"
  listingType: string; // "Rent", "Sale"
  location: string;
  societyName: string;
  streetAddress: string;
  area: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  balconies: number;
  amenities: string[];
  description: string;
  rent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  leaseTerm: string;
  photos: string[];
  latitude: number;
  longitude: number;
  distancesFromOffices: Record<string, number>; // e.g., { "flipkart": 1.5, "google": 2.0 }
  createdAt: string; // ISO date format
  updatedAt: string; // ISO date format
  views: number;
  link: string;
}
