import { getClient } from '@/lib/apollo-client';
import { GET_ALL_LINKED_USER_ACCOUNTS } from '@/app/queries';
import { DashboardClient } from './dashboard-client';

export default async function Dashboard() {
  const apolloClient = getClient();
  const { data } = await apolloClient.query({
    query: GET_ALL_LINKED_USER_ACCOUNTS,
  });

  return <DashboardClient userData={data} />;
}
