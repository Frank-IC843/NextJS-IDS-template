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

// how to override the theme
const themeOverrides = {
  colors: {
    brandPrimaryRegular: "#2563eb", // Blue
    brandPrimaryDark: "#1d4ed8", // Darker blue
    brandPrimaryExtraDark: "#1e40af", // Deep blue
    brandSecondaryRegular: "#64748b", // Slate
    brandSecondaryDark: "#475569", // Darker slate
    brandSecondaryLight: "#94a3b8", // Light slate
    brandHighlightRegular: "#0ea5e9", // Sky blue
    brandHighlightDark: "#0284c7", // Darker sky blue
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
