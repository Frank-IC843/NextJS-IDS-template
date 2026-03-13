'use client';

import { Text } from '@instacart/ids-customers';
import { BusinessInfoSettings } from '@/app/settings/business-info-settings';

const useStyles = () => {
  return {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
    },
    header: {
      marginBottom: '32px',
    },
    section: {
      marginBottom: '32px',
    },
  } as const;
};

export function SettingsContent() {
  const styles = useStyles();

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <Text typography="headlineLarge2">Business Settings</Text>
        <Text typography="bodyLarge2" color="systemGrayscale60">
          Manage your business information and preferences
        </Text>
      </div>

      <div css={styles.section}>
        <BusinessInfoSettings />
      </div>
    </div>
  );
}
