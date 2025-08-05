'use client';

import { useRouter } from 'next/navigation';
import { IdsProvider, ThemeOverrides, coreTheme } from '@instacart/ids-core';
import { ApolloWrapper } from '@/lib/apollo-wrapper';

declare module '@instacart/ids-core' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>;
  }
}

/*
 * Sample theme overrides
 * This can be a partial list, missing atoms falling back to the default theme
 */
// Simple utility function for button hover effects
const createButtonColors = (baseColor: string) => ({
  base: baseColor,
  hover: `color-mix(in sRGB, ${baseColor} 85%, black 15%)`, // 15% darker on hover
  press: `color-mix(in sRGB, ${baseColor} 75%, black 25%)`, // 25% darker on press
});

const defaultTheme = {
  colors: {
    brandPrimaryRegular: '#0AAD0A',
    brandPrimaryDark: '#098A09',
    brandPrimaryExtraDark: '#0C670C',
    brandSecondaryRegular: '#72767E',
    brandSecondaryDark: '#343538',
    brandSecondaryLight: '#F6F7F8',
    brandHighlightRegular: '#2B78C6',
    brandHighlightDark: '#1F5A96',
  },
};

function getBusinessThemeOverrides(): ThemeOverrides {
  // Simple color variants for each button
  const primaryColors = createButtonColors('#553A7A'); // Perfect purple (30% lighter than #10004A)
  const secondaryColors = createButtonColors(coreTheme.colors.brandBusinessBlueberry); // Bright blue
  const detrimentalColors = createButtonColors('#DC2626'); // Red

  return {
    colors: defaultTheme.colors,
    components: {
      button: {
        radiusStandard: coreTheme.radius.round,
        radiusSmall: 999,
        radiusCompact: 999,
        disabledBorderColor: '#C7C8CD',
      },
      buttonPrimary: {
        // Dark purple solid button (matches header)
        color: primaryColors.base, // #10004A
        hoverColor: primaryColors.hover,
        pressColor: primaryColors.press,
        textColor: '#FFFFFF',
      },
      buttonSecondary: {
        // Bright blue solid button
        color: secondaryColors.base, // #6672FA
        hoverColor: secondaryColors.hover,
        pressColor: secondaryColors.press,
        textColor: '#FFFFFF',
      },
      buttonTertiary: {
        // White outlined button with blue border
        color: '#FFFFFF',
        hoverColor: `color-mix(in sRGB, #FFFFFF 95%, ${coreTheme.colors.brandBusinessBlueberry} 5%)`,
        pressColor: `color-mix(in sRGB, #FFFFFF 90%, ${coreTheme.colors.brandBusinessBlueberry} 10%)`,
        borderPressColor: coreTheme.colors.brandBusinessBlueberry,
        borderHoverColor: coreTheme.colors.brandBusinessBlueberry,
        borderColor: coreTheme.colors.brandBusinessBlueberry,
        borderWidth: 2,
        textColor: coreTheme.colors.brandBusinessBlueberry,
        disabledBorderColor: '#C7C8CD',
      },
      buttonDetrimental: {
        // Red solid button
        colorBackgroundType: 'static-color',
        color: detrimentalColors.base,
        hoverColor: detrimentalColors.hover,
        pressColor: detrimentalColors.press,
        textColor: '#FFFFFF',
      },
    },
  };
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // You can now use getBusinessThemeOverrides() or defaultTheme
  // Example: const businessTheme = getBusinessThemeOverrides();

  return (
    <ApolloWrapper>
      <IdsProvider
        themeOverrides={getBusinessThemeOverrides()}
        routing={{
          navigate: router.push,
        }}
      >
        {children}
      </IdsProvider>
    </ApolloWrapper>
  );
}
