// app/StoreProvider.tsx
"use client"
import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../lib/store';
import { setProperties } from '../lib/features/property/propertySlice';
import { Property } from '../models/Property';

interface StoreProviderProps {
  children: React.ReactNode;
  initialProperties?: Property[]; // Optionally pass initial property data
}

export default function StoreProvider({ children, initialProperties }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  // Create the store instance the first time this renders
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Initialize the store with properties if provided
  useEffect(() => {
    if (initialProperties && storeRef.current) {
      storeRef.current.dispatch(setProperties(initialProperties));
    }
  }, [initialProperties]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
