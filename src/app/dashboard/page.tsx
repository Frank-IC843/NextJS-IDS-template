import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { mockDashboardData } from '@/app/dashboard/dashboard-mock-data';

export default function Dashboard() {
  return <DashboardContent dashboard={mockDashboardData} />;
}
