'use client';

import { Header } from './header';
import { Sidebar } from './sidebar';
import { AIButton } from './ai-button';

function useStyles() {
  return {
    layoutGrid: {
      display: 'grid',
      gridTemplateRows: '80px 1fr', // Header height, then remaining space
      gridTemplateColumns: '270px 1fr', // Sidebar width, then remaining space
      gridTemplateAreas: `
        "header header"
        "sidebar main"
      `,
      height: '100vh',
      width: '100vw',
      maxHeight: '100vh',
      maxWidth: '100vw',
      boxSizing: 'border-box' as const,
      overflow: 'hidden', // Prevent any overflow from the grid container
    },
    header: {
      gridArea: 'header',
    },
    sidebar: {
      gridArea: 'sidebar',
      overflow: 'hidden', // Prevent sidebar from overflowing its grid area
    },
    main: {
      gridArea: 'main',
      paddingLeft: '40px',
      paddingRight: '80px',
      paddingTop: '24px',
      overflow: 'auto', // Allow main content to scroll if needed
      maxHeight: '100%', // Constrain to grid area
    },
  } as const;
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const styles = useStyles();

  return (
    <div css={styles.layoutGrid}>
      <div css={styles.header}>
        <Header />
      </div>
      <div css={styles.sidebar}>
        <Sidebar />
      </div>
      <main css={styles.main}>{children}</main>
      <AIButton />
    </div>
  );
}
