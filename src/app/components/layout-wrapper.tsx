'use client';

import { Header } from './header';
import { Sidebar } from './sidebar';

function useStyles() {
  return {
    layoutGrid: {
      display: 'grid',
      gridTemplateRows: '80px 1fr', // Header height, then remaining space
      gridTemplateColumns: '240px 1fr', // Sidebar width, then remaining space
      gridTemplateAreas: `
        "header header"
        "sidebar main"
      `,
      height: '100vh',
      width: '100vw',
      maxHeight: '100vh',
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
    },
    header: {
      gridArea: 'header',
    },
    sidebar: {
      gridArea: 'sidebar',
    },
    main: {
      gridArea: 'main',
      padding: '0px 40px',
      overflow: 'auto',
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
    </div>
  );
}
