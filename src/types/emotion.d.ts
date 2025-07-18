/// <reference types="@emotion/react/types/css-prop" />
import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      brandPrimaryRegular: string;
      brandPrimaryDark: string;
      brandPrimaryExtraDark: string;
      brandSecondaryRegular: string;
      brandSecondaryDark: string;
      brandSecondaryLight: string;
      brandHighlightRegular: string;
      brandHighlightDark: string;
    };
  }
}
