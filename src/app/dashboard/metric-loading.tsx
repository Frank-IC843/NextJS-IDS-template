const styles = {
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
    flexDirection: 'column',
    gap: '20px',
  } as React.CSSProperties,
  skeleton: {
    height: '16px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
  } as React.CSSProperties,
  skeletonShort: {
    height: '16px',
    width: '60%',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
  } as React.CSSProperties,
} as const;

export function MetricLoading() {
  return (
    <div style={styles.card}>
      <div style={styles.cardLoading}>
        <div style={styles.skeleton}></div>
        <div style={styles.skeletonShort}></div>
      </div>
    </div>
  );
}
