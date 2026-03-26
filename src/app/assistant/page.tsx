import { AssistantWorkspace } from '@/app/assistant/assistant-workspace';
import { readyInsightPrompts } from '@/app/insights/insights-catalog';

export const dynamic = 'force-dynamic';

const assistantPromptSuggestions = readyInsightPrompts.slice(0, 3);

export default function AssistantPage() {
  return <AssistantWorkspace promptSuggestions={assistantPromptSuggestions} />;
}
