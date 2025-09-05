'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_LAST_USER_LOCATION, DEFAULT_SHOP_QUERY } from '@/app/queries';
import { GetLastUserLocationQuery, DefaultShopQuery, UsersCoordinatesInput } from '@/__generated__/graphql-types';

interface ShopContextType {
  shopId: string | null;
  postalCode: string | null;
  coordinates: UsersCoordinatesInput | null;
  isLoading: boolean;
  fetchUserLocationAndShop: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
}

export function ShopProvider({ children }: ShopProviderProps) {
  const [shopId, setShopId] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<UsersCoordinatesInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fetchLocation] = useLazyQuery<GetLastUserLocationQuery>(GET_LAST_USER_LOCATION);
  const [fetchShop] = useLazyQuery<DefaultShopQuery>(DEFAULT_SHOP_QUERY);

  const fetchUserLocationAndShop = async () => {
    setIsLoading(true);

    try {
      // First, fetch user location
      const locationResult = await fetchLocation();

      if (locationResult.data?.lastUserLocation) {
        const location = locationResult.data.lastUserLocation;
        const userPostalCode = location.postalCode;
        const userCoordinates = location.coordinates
          ? {
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
            }
          : null;

        setPostalCode(userPostalCode);
        setCoordinates(userCoordinates);

        // Then fetch default shop if we have the needed data
        if (userPostalCode && userCoordinates) {
          const shopResult = await fetchShop({
            variables: {
              postalCode: userPostalCode,
              coordinates: userCoordinates,
              addressId: location.addressId || undefined,
            },
          });

          if (shopResult.data?.defaultShop) {
            setShopId(shopResult.data.defaultShop.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching location and shop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: ShopContextType = {
    shopId,
    postalCode,
    coordinates,
    isLoading,
    fetchUserLocationAndShop,
  };

  return <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
