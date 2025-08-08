'use client';

import { PrimaryButtonSmall } from './buttons';
import { useState } from 'react';

export const LoginButton = () => {
  const [loading, setLoading] = useState(false);

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
          identifier: 'frank.su@instacart.com',
          identifier_type: 'email',
          verification_code: '671415',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
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
