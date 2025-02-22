// src/redux/slices/propertySlice.tsx

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Property } from '../../../models/Property';

interface PropertyState {
  properties: Property[]; // Array of properties
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    // Set loading state when fetching data
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Set an error state if an API call fails
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Set the properties in the state
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
    },
    // Add a new property to the state
    addProperty: (state, action: PayloadAction<Property>) => {
      state.properties.push(action.payload);
    },
    // Update an existing property by its ID
    updateProperty: (state, action: PayloadAction<Property>) => {
      const index = state.properties.findIndex(
        (property) => property.id === action.payload.id
      );
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
    },
    // Remove a property by its ID
    removeProperty: (state, action: PayloadAction<string>) => {
      state.properties = state.properties.filter(
        (property) => property.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  setProperties,
  addProperty,
  updateProperty,
  removeProperty,
} = propertySlice.actions;

export default propertySlice.reducer;
