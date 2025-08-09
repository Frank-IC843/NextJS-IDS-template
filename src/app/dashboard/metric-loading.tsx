'use client';

import React from 'react';

const useStyles = () => {
  return {
    card: {
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      flex: 1,
      maxWidth: '403px',
      padding: '16px',
      backgroundColor: '#fff',
    },
    cardLoading: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    },
    skeleton: {
      height: '16px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    skeletonShort: {
      height: '16px',
      width: '60%',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
  } as const;
};

export function MetricLoading() {
  const styles = useStyles();

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
      <div css={styles.card}>
        <div css={styles.cardLoading}>
          <div css={styles.skeleton} />
          <div css={styles.skeletonShort} />
        </div>
      </div>
    </>
  );
}
