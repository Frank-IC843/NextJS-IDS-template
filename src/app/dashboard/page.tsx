import { Suspense } from 'react';
import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { LoadingOnEnter } from '@/app/components/loading-on-enter';
import { GET_ALL_LINKED_USER_ACCOUNTS } from '@/app/queries';
import { getClient } from '@/lib/apollo-client';

export default async function Dashboard() {
  const client = getClient();
  const result = await client.query({ query: GET_ALL_LINKED_USER_ACCOUNTS });

  return (
    <Suspense fallback={<LoadingOnEnter />}>
      <DashboardContent data={result.data} />
    </Suspense>
  );
}
