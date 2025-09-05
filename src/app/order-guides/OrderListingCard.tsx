'use client';

import { Theme, responsive, spacing, useTheme } from '@instacart/ids-core';
import { RetailerAvatarMedium, SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

const useStyles = ({ theme }: { theme: Theme }) =>
  ({
    container: {
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: `${spacing.s12}px ${spacing.s24}px`,
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
};

function SubtitleLine({ children }: { children?: string | null }) {
  if (!children) {
    return null;
  }

  return <Text typography="bodyRegular">{children}</Text>;
}

function ActionButton({ action, onClick }: { action: Action; onClick: () => void }) {
  return <SecondaryButtonSmall onClick={onClick}>{action.ctaString}</SecondaryButtonSmall>;
}

export function OrderListingCard({
  name,
  subtitleLine1,
  subtitleLine2,
  retailerIconImage,
  retailerIconBackgroundColorHexString,
  actions,
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
          {actions.map(action => (
            <ActionButton key={action.ctaString} action={action} onClick={() => handlePressAction(action)} />
          ))}
        </div>
      )}
    </div>
  );
}
