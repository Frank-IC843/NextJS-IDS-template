'use client';

import { CORE_COLORS } from '@instacart/ids-core';

export function Header() {
  return (
    <header
      style={{
        height: '100px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: CORE_COLORS.brandBusinessElderberry,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '20px',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Header
      </h1>
    </header>
  );
}
