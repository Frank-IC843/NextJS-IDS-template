import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { GET_ALL_LINKED_USER_ACCOUNTS } from '@/app/queries';
import { getClient } from '@/lib/apollo-client';

export default async function Dashboard() {
  const client = getClient();
  const [userAccountsResult] = await Promise.all([client.query({ query: GET_ALL_LINKED_USER_ACCOUNTS })]);

  return <DashboardContent data={userAccountsResult.data} />;
}
