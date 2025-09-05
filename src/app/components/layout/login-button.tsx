'use client';

import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CREATE_USER_SESSION_FROM_CODE } from '@/app/queries';
import { UsersAccountTypes, UsersIdentityType } from '@/__generated__/graphql-types';
import { useShop } from '@/app/contexts/shop-context';

export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { fetchUserLocationAndShop } = useShop();

  const [createUserSession] = useMutation(CREATE_USER_SESSION_FROM_CODE, {
    onCompleted: async data => {
      const result = data?.createUserSessionFromVerificationCode;
      if (result?.token) {
        console.log('Login successful:', result);
        // Fetch user location and shop after successful login
        fetchUserLocationAndShop();
        router.push('/dashboard');
      } else if (result?.errorTypes) {
        console.error('Login failed:', result.errorTypes);
        alert(`Login failed: ${result.errorTypes.join(', ')}`);
      }
      setLoading(false);
    },
    onError: error => {
      console.error('Login error:', error);
      alert(`Login error: ${error.message}`);
      setLoading(false);
    },
  });

  const handleLogin = async () => {
    console.log('Login button clicked!');
    setLoading(true);

    try {
      await createUserSession({
        variables: {
          identifier: 'liming.kang@instacart.com',
          identifier_type: UsersIdentityType.Email,
          verification_code: '671415',
          accountType: UsersAccountTypes.Business,
        },
      });
    } catch (error) {
      // Error is already handled in onError callback
      console.error('Mutation error:', error);
    }
  };

  return (
    <PrimaryButtonSmall onPress={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Log In'}
    </PrimaryButtonSmall>
  );
};
