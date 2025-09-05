'use client';

import { Theme, responsive, spacing, useTheme, TrashIcon } from '@instacart/ids-core';
import {
  PrimaryButtonSmall,
  RetailerAvatarMedium,
  SecondaryButtonSmall,
  Text,
  IconButton,
} from '@instacart/ids-customers';
import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

const useStyles = ({ theme }: { theme: Theme }) =>
  ({
    container: {
      position: 'relative',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: `${spacing.s12}px ${spacing.s24}px`,
    },
    deleteButton: {
      position: 'absolute',
      top: spacing.s8,
      right: spacing.s8,
      zIndex: 1,
    },
    retailerArea: {
      display: 'flex',
      padding: `${spacing.s12}px 0`,
    },
    titleArea: {
      marginLeft: spacing.s12,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    buttonsArea: {
      display: 'flex',
      gap: spacing.s12,
      flexDirection: 'column',
      padding: `${spacing.s8}px 0`,

      [responsive.up('r')]: {
        flexDirection: 'row',
      },
    },
  }) as const;

export type Action = {
  ctaString: string;
  ctaColor?: string;
  navigateToUrlCtaAction?: {
    url: string;
  };
  modal?: {
    title: string;
    body: string;
  };
};

type Props = {
  name: string;
  subtitleLine1?: string | null;
  subtitleLine2?: string | null;
  retailerIconImage?: {
    templateUrl: string;
    altText?: string | null;
  } | null;
  retailerIconBackgroundColorHexString?: string | null;
  actions: Action[];
  onDelete?: () => void;
};

function SubtitleLine({ children }: { children?: string | null }) {
  if (!children) {
    return null;
  }

  return <Text typography="bodyRegular">{children}</Text>;
}

export function OrderListingCard({
  name,
  subtitleLine1,
  subtitleLine2,
  retailerIconImage,
  retailerIconBackgroundColorHexString,
  actions,
  onDelete,
  children,
}: PropsWithChildren<Props>) {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles({ theme });

  const handlePressAction = (action: Action) => {
    if (action.navigateToUrlCtaAction) {
      router.push(action.navigateToUrlCtaAction.url);
    }
  };

  return (
    <div css={styles.container}>
      {onDelete && (
        <IconButton
          css={styles.deleteButton}
          onClick={onDelete}
          accessibleLabel="Delete order guide"
          icon={() => <TrashIcon size={spacing.s24} />}
        />
      )}
      <div css={styles.retailerArea}>
        {retailerIconImage && (
          <RetailerAvatarMedium
            templateUrl={retailerIconImage.templateUrl}
            alt={retailerIconImage.altText ?? undefined}
            fillColor={retailerIconBackgroundColorHexString ?? ''}
          />
        )}
        <div css={styles.titleArea}>
          <Text typography="subtitle">{name}</Text>
          <SubtitleLine>{subtitleLine1}</SubtitleLine>
          <SubtitleLine>{subtitleLine2}</SubtitleLine>
        </div>
      </div>

      {children}

      {actions.length > 0 && (
        <div css={styles.buttonsArea}>
          {actions.map((action, index) => {
            if (index === 0) {
              return (
                <PrimaryButtonSmall key={action.ctaString} onClick={() => handlePressAction(action)}>
                  {action.ctaString}{' '}
                </PrimaryButtonSmall>
              );
            }
            return (
              <SecondaryButtonSmall key={action.ctaString} onClick={() => handlePressAction(action)}>
                {action.ctaString}
              </SecondaryButtonSmall>
            );
          })}
        </div>
      )}
    </div>
  );
}
