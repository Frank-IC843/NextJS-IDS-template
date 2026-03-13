'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Text, SecondaryButton } from '@instacart/ids-customers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const useStyles = () => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      minHeight: '200px',
      textAlign: 'center' as const,
    },
    errorTitle: {
      marginBottom: '16px',
      color: '#dc3545',
    },
    errorMessage: {
      marginBottom: '24px',
      color: '#666',
      maxWidth: '500px',
    },
    resetButton: {
      marginTop: '16px',
    },
  } as const;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return <ErrorBoundaryContent error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// Separate component for the error UI to use hooks
function ErrorBoundaryContent({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const styles = useStyles();

  return (
    <div css={styles.container}>
      <Text typography="headline" css={styles.errorTitle}>
        Something went wrong
      </Text>
      <Text typography="bodyMedium1" css={styles.errorMessage}>
        {error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
      </Text>
      <SecondaryButton onClick={onReset} css={styles.resetButton}>
        Try Again
      </SecondaryButton>
    </div>
  );
}
