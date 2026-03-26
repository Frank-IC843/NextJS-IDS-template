'use client';

import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { Text } from '@instacart/ids-customers';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!identifier.trim() || !verificationCode.trim()) {
      setErrorMessage('Enter your Instacart email and verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          verification_code: verificationCode.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const errorMessage = typeof payload?.error === 'string' ? payload.error : 'Login failed';
        console.error('Login failed:', payload);
        setErrorMessage(errorMessage);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '360px',
      }}
    >
      <Text typography="titleMedium">Internal sign in</Text>
      <input
        value={identifier}
        onChange={event => setIdentifier(event.target.value)}
        placeholder="name@instacart.com"
        css={{
          minHeight: '40px',
          padding: '0 12px',
          borderRadius: '12px',
          border: '1px solid #D1D5DB',
          font: 'inherit',
        }}
      />
      <input
        value={verificationCode}
        onChange={event => setVerificationCode(event.target.value)}
        placeholder="Verification code"
        css={{
          minHeight: '40px',
          padding: '0 12px',
          borderRadius: '12px',
          border: '1px solid #D1D5DB',
          font: 'inherit',
        }}
      />
      {errorMessage ? (
        <Text typography="bodyRegular" color="systemDetrimentalRegular">
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButtonSmall onPress={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </PrimaryButtonSmall>
    </div>
  );
};
