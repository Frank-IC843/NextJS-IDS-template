'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { GET_LAST_USER_LOCATION, DEFAULT_SHOP_QUERY, CREATE_USER_SESSION_FROM_CODE } from '@/app/queries';
import {
  GetLastUserLocationQuery,
  DefaultShopQuery,
  UsersCoordinatesInput,
  UsersIdentityType,
  UsersAccountTypes,
  CreateUserSessionFromVerificationCodeMutation,
} from '@/__generated__/graphql-types';

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
  const hasLoggedIn = useRef(false);
  const [fetchLocation] = useLazyQuery<GetLastUserLocationQuery>(GET_LAST_USER_LOCATION);
  const [fetchShop] = useLazyQuery<DefaultShopQuery>(DEFAULT_SHOP_QUERY);

  const fetchUserLocationAndShop = useCallback(async () => {
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
  }, [fetchLocation, fetchShop]);

  const [createUserSession] = useMutation(CREATE_USER_SESSION_FROM_CODE, {
    onCompleted: useCallback(
      async (data: CreateUserSessionFromVerificationCodeMutation) => {
        const result = data?.createUserSessionFromVerificationCode;
        if (result && 'token' in result) {
          console.log('Login successful:', result);
          // Fetch user location and shop after successful login
          fetchUserLocationAndShop();
        } else if (result && 'errorTypes' in result) {
          console.error('Login failed:', result.errorTypes);
          alert(`Login failed: ${result.errorTypes.join(', ')}`);
        }
      },
      [fetchUserLocationAndShop]
    ),
    onError: useCallback((error: ApolloError) => {
      console.error('Login error:', error);
      alert(`Login error: ${error.message}`);
    }, []),
  });

  const performLogin = useCallback(() => {
    if (hasLoggedIn.current) {
      return;
    }
    hasLoggedIn.current = true;

    createUserSession({
      variables: {
        identifier: 'liming.kang@instacart.com',
        identifier_type: UsersIdentityType.Email,
        verification_code: '671415',
        accountType: UsersAccountTypes.Business,
      },
    });
  }, [createUserSession]);

  useEffect(() => {
    performLogin();
  }, [performLogin]);

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
