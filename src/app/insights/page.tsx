import {
  insightCoverageAuditNotes,
  insightCoverageSummary,
  insightQuestionCatalog,
  readyInsightPrompts,
} from '@/app/insights/insights-catalog';
import { INSIGHTS_SAVED_VIEWS_COOKIE, hasInternalInsightsAccess, readSavedViews } from '@/app/insights/insights-server-utils';
import { InsightsWorkspace } from '@/app/insights/insights-workspace';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const cookieStore = await cookies();
  const initialSavedViews = readSavedViews(cookieStore.get(INSIGHTS_SAVED_VIEWS_COOKIE)?.value);
  const hasInsightsAccess = hasInternalInsightsAccess(cookieStore);

  return (
    <InsightsWorkspace
      questionCatalog={insightQuestionCatalog}
      promptSuggestions={readyInsightPrompts}
      coverageSummary={insightCoverageSummary}
      coverageAuditNotes={insightCoverageAuditNotes}
      initialSavedViews={initialSavedViews}
      hasInsightsAccess={hasInsightsAccess}
    />
  );
}
