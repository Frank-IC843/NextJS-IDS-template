'use client';

import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: 'test@instacart.com',
          verification_code: '671415',
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const errorMessage = typeof payload?.error === 'string' ? payload.error : 'Login failed';
        console.error('Login failed:', payload);
        alert(errorMessage);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
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
