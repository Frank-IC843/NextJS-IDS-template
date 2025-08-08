'use client';

import { PrimaryButtonSmall } from './buttons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    console.log('Login button clicked!');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: 'frank.su+1@fernet.io',
          identifier_type: 'email',
          verification_code: '671415',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        router.push('/dashboard');
      } else {
        console.error('Login failed:', data.error);
        alert(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryButtonSmall onPress={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Log In'}
    </PrimaryButtonSmall>
  );
};
