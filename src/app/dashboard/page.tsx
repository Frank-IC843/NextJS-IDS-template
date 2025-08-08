import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { BUSINESS_MONTHS_QUERY } from '@/app/queries';
import { getClient } from '@/lib/apollo-client';

export default async function Dashboard() {
  const client = getClient();
  const [businessMonthsResult] = await Promise.all([client.query({ query: BUSINESS_MONTHS_QUERY })]);

  return <DashboardContent businessMonthsData={businessMonthsResult.data} />;
}
