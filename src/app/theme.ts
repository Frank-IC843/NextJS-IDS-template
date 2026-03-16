import type { ThemeOverrides } from '@instacart/ids-core';

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

export function getBusinessThemeOverrides(): ThemeOverrides {
  return {
    colors: defaultTheme.colors,
    components: {
      button: {
        radiusStandard: 999,
        radiusSmall: 999,
        radiusCompact: 999,
        disabledBorderColor: '#C7C8CD',
      },
    },
  };
}
