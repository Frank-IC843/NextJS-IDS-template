import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { dashboardPromptSuggestions } from '@/app/dashboard/dashboard-builder-mocks';
import { listSavedDashboards } from '@/app/dashboard/dashboard-saved-store';
import { supportedDashboardWidgets } from '@/app/dashboard/dashboard-supported-widgets';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const initialSavedDashboards = await listSavedDashboards();

  return (
    <DashboardContent
      initialWidgets={[]}
      initialSavedDashboards={initialSavedDashboards}
      initialErrorMessage={null}
      promptSuggestions={dashboardPromptSuggestions}
      supportedWidgets={supportedDashboardWidgets}
    />
  );
}
