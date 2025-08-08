import { Suspense } from 'react';
import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { LoadingOnEnter } from '@/app/components/loading-on-enter';

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingOnEnter />}>
      <DashboardContent />
    </Suspense>
  );
}
