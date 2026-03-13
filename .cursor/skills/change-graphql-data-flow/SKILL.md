---
name: change-graphql-data-flow
description: Implements GraphQL and Apollo changes in this repo. Use when adding or editing queries, mutations, fragments, generated types, Apollo client wiring, or GraphQL-backed UI.
---

# Change GraphQL Data Flow

## Quick rules

- Put feature operations in an existing nearby `queries.ts`; if none exists, create one. `codegen.ts` only scans `src/**/queries.ts`.
- Import generated types from `@/__generated__/graphql-types`.
- Never hand-edit `src/__generated__`.
- Keep endpoint configuration in `@/lib/constants.ts` and Apollo wiring in `@/lib/apollo-client.ts` or `@/lib/apollo-wrapper.tsx`.

## Read patterns

- Server Component or server utility: use the registered Apollo client from `@/lib/apollo-client`.
- Client Component: use Apollo hooks inside the existing provider tree from `@/app/providers.tsx`.
- In GraphQL-backed UI, handle loading, error, and empty states intentionally.
- Prefer deriving values from query results during render instead of copying them into local state with `useEffect`.

## Mutation pattern

1. Add or update the GraphQL document in `queries.ts`.
2. Use generated types instead of manual duplicate interfaces.
3. Wire the mutation into the existing server or client flow.
4. If the operation, fragment, or variables shape changed, run `yarn codegen`.
5. Refresh or revalidate the affected UI after a successful mutation using the smallest fitting strategy: Apollo cache updates, `refetchQueries`, or Next.js revalidation.

## Biases

- Prefer reusing fragments and query constants over duplicating documents.
- Prefer small data-shape changes over adding translation layers unless the API shape is truly awkward.
- Keep user-triggered mutation flow in event handlers or form actions rather than effect-driven orchestration.

## Examples

- See [examples.md](examples.md) for concrete examples of:
  - Query placement in `queries.ts`
  - Server-side Apollo reads
  - Client-side mutation wiring
  - Avoiding query-to-state effect sync
