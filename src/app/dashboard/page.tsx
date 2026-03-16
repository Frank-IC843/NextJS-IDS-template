import { DashboardContent } from '@/app/dashboard/dashboard-content';
import { dashboardPromptSuggestions } from '@/app/dashboard/dashboard-builder-mocks';
import { supportedDashboardWidgets } from '@/app/dashboard/dashboard-supported-widgets';

export default function Dashboard() {
  return (
    <DashboardContent
      initialWidgets={[]}
      promptSuggestions={dashboardPromptSuggestions}
      supportedWidgets={supportedDashboardWidgets}
    />
  );
}
