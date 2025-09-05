'use client';

import { useTheme } from '@instacart/ids-core';
import { Text, Image, SecondaryButtonSmall } from '@instacart/ids-customers';
import { useRouter } from 'next/navigation';

interface OrderGuideCardProps {
  id: string;
  name: string;
  description?: string;
  retailerName?: string;
  retailerLogoUrl?: string;
  retailerBackgroundColor?: string;
  itemCount?: number;
  memberCount?: number;
  viewUrl?: string;
  manageMembersUrl?: string;
}

function useStyles() {
  const theme = useTheme();
  return {
    card: {
      background: '#ffffff',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    retailerLogo: {
      width: '48px',
      height: '48px',
      borderRadius: theme.radius.r8,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    },
    headerInfo: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    memberAvatars: {
      display: 'flex',
      gap: '-8px',
      alignItems: 'center',
      marginTop: '4px',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: `2px solid #ffffff`,
      background: theme.colors.systemGrayscale20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '-8px',
      '&:first-of-type': {
        marginLeft: 0,
      },
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
    },
    actionButton: {
      flex: 1,
      height: '36px',
      fontSize: '14px',
    },
  } as const;
}

export function OrderGuideCard({
  id,
  name,
  retailerName,
  retailerLogoUrl,
  retailerBackgroundColor = '#ffffff',
  itemCount = 0,
  memberCount = 1,
  viewUrl,
  manageMembersUrl,
}: OrderGuideCardProps) {
  const styles = useStyles();
  const router = useRouter();

  const handleViewClick = () => {
    if (viewUrl) {
      router.push(viewUrl);
    } else {
      router.push(`/business/order-guide/${id}`);
    }
  };

  const handleManageMembersClick = () => {
    if (manageMembersUrl) {
      router.push(manageMembersUrl);
    } else {
      router.push(`/business/order-guide/${id}?tab=members`);
    }
  };

  // Format the summary text
  const summaryText = `${itemCount} ${itemCount === 1 ? 'item' : 'items'} • ${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;

  // Use placeholder logo if not provided
  const logoUrl =
    retailerLogoUrl || `https://via.placeholder.com/96x96/f5f5f5/999?text=${(retailerName || 'Store').charAt(0)}`;

  return (
    <div css={styles.card}>
      {/* Header with logo and title */}
      <div css={styles.header}>
        <div css={styles.retailerLogo} style={{ background: retailerBackgroundColor }}>
          <Image templateUrl={logoUrl} alt={retailerName || 'Retailer'} width={48} height={48} />
        </div>
        <div css={styles.headerInfo}>
          <Text typography="bodyLarge1">{name}</Text>
          {retailerName && (
            <Text typography="bodyRegular" color="systemGrayscale70">
              at {retailerName}
            </Text>
          )}
          <Text typography="bodyRegular" color="systemGrayscale70">
            {summaryText}
          </Text>
        </div>
      </div>

      {/* Member avatars placeholder */}
      <div css={styles.memberAvatars}>
        <div css={styles.avatar}>
          <Text typography="bodySmall1" color="systemGrayscale70">
            👤
          </Text>
        </div>
        {memberCount > 1 && (
          <div css={styles.avatar}>
            <Text typography="bodySmall1" color="systemGrayscale70">
              👥
            </Text>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div css={styles.actions}>
        <SecondaryButtonSmall css={styles.actionButton} onClick={handleViewClick}>
          View order guide
        </SecondaryButtonSmall>
        <SecondaryButtonSmall css={styles.actionButton} onClick={handleManageMembersClick}>
          Manage members
        </SecondaryButtonSmall>
      </div>
    </div>
  );
}

export default OrderGuideCard;
