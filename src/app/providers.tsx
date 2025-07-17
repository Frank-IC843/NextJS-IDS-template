"use client";

import { useRouter } from "next/navigation";
import { IdsProvider } from "@instacart/ids-core";

declare module "@instacart/ids-core" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

/*
 * Sample theme overrides
 * This can be a partial list, missing atoms falling back to the default theme
 */
const themeOverrides = {
  colors: {
    brandPrimaryRegular: "#0AAD0A",
    brandPrimaryDark: "#098A09",
    brandPrimaryExtraDark: "#0C670C",
    brandSecondaryRegular: "#72767E",
    brandSecondaryDark: "#343538",
    brandSecondaryLight: "#F6F7F8",
    brandHighlightRegular: "#2B78C6",
    brandHighlightDark: "#1F5A96",
  },
};

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <IdsProvider
      themeOverrides={themeOverrides}
      routing={{
        navigate: router.push,
      }}
    >
      {children}
    </IdsProvider>
  );
}
