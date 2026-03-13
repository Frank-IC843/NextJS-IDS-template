---
name: build-nextjs-feature
description: Implements features quickly in this Next.js 15 App Router repo while preserving server/client boundaries, Apollo patterns, IDS UI usage, and hackathon pragmatism. Use when adding pages, flows, components, server actions, route handlers, or app-level UI.
---

# Build Next.js Feature

## Default approach

- Start with the smallest working change that fits nearby code.
- Reuse existing components, queries, and utilities before introducing new abstractions.
- Colocate route-specific components, hooks, and utilities with the route segment by default.
- Skip tests, broad refactors, and cleanup-only work unless the user asks.

## Architecture choice

1. Default to a Server Component.
2. Add `'use client'` only for state, effects, event handlers, context, or browser APIs.
3. Use a Server Action for UI-triggered mutations when a form or event can call server code directly.
4. Use a Route Handler only for external HTTP consumers, proxying, webhooks, file responses, or explicit method handling.
5. In a Server Component, do not fetch the app's own Route Handlers just to reach server logic.

## React correctness

- Put side effects caused by user actions in event handlers, not in `useEffect`.
- Derive values during render when they can come from props, state, or query results.
- Do not add `useMemo`, `useCallback`, or `React.memo` for new code. This repo uses the React Compiler.
- Use functional state updates when the next value depends on the previous one.
- Use `useRef` for transient values that should not trigger re-renders.

## Data and caching

- Prefer server-side data reads for initial page loads.
- Be explicit with caching. `fetch()` is not cached by default in Next.js 15.
- Revalidate after mutations with `revalidatePath`, `revalidateTag`, or `updateTag`.

## Repo specifics and handoffs

- Use IDS components and Emotion for UI.
- Prefer the `css` prop over inline `style`, and use theme or IDS tokens for colors, typography, spacing, and radius.
- Handle loading, error, and empty states for new data-driven UI.
- For GraphQL-heavy changes, use the `change-graphql-data-flow` skill or the `graphql-apollo-specialist` subagent.
- For multi-file App Router changes, use the `app-router-architect` subagent before implementation.

## Examples

- See [references/patterns.md](references/patterns.md) for concrete examples of:
  - Server Component plus small Client Component boundaries
  - Event handlers over effect-driven orchestration
  - Derived state during render
  - Avoiding manual memoization with the React Compiler

## Done criteria

- The change is narrow, understandable, and consistent with nearby code.
- The client boundary is as small as practical.
- Data flow is direct and avoids unnecessary internal network hops.
