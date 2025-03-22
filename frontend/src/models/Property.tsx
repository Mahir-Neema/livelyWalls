// src/models/Property.ts
export interface Property {
  id: string,
  photos: string[],
  propertyType: string,
  listingType: string,
  genderPreference: string,
  location: string,
  description: string,
  rent: number,
  bedrooms: number,
  bathrooms: number,
  isBrokerListing: boolean,
  isVegetarianPreferred: boolean,
  isFamilyPreferred: boolean
}