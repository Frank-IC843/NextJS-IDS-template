import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { loadDashboardPageData } from '@/app/dashboard/dashboard-data';
import { dashboardPromptSuggestions } from '@/app/dashboard/dashboard-builder-mocks';
import { supportedDashboardWidgets } from '@/app/dashboard/dashboard-supported-widgets';

export default async function Dashboard() {
  const { widgets, errorMessage } = await loadDashboardPageData();

  return (
    <DashboardContent
      initialWidgets={widgets}
      initialErrorMessage={errorMessage}
      promptSuggestions={dashboardPromptSuggestions}
      supportedWidgets={supportedDashboardWidgets}
    />
  );
}
