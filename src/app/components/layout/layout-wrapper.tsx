'use client';

import { Header } from '@/app/components/layout/header';
import { Sidebar } from '@/app/components/layout/sidebar';

const styles = {
  layoutGrid: {
    display: 'grid',
    gridTemplateRows: '80px 1fr',
    gridTemplateColumns: '270px 1fr',
    gridTemplateAreas: `
      "header header"
      "sidebar main"
    `,
    height: '100vh',
    width: '100vw',
    maxHeight: '100vh',
    maxWidth: '100vw',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  },
  header: {
    gridArea: 'header',
  },
  sidebar: {
    gridArea: 'sidebar',
    overflow: 'hidden',
  },
  main: {
    gridArea: 'main',
    paddingLeft: '40px',
    paddingRight: '80px',
    paddingTop: '24px',
    overflow: 'auto',
    maxHeight: '100%',
  },
} as const;

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
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
