'use client';

import { useTheme } from '@instacart/ids-core';
import { SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useState } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { InsightsResultChart } from '@/app/insights/insights-result-chart';
import type {
  InsightAnswerShape,
  InsightQueryResponse,
  InsightQuestionDefinition,
  InsightSavedView,
  InsightTableColumn,
  InsightTableRow,
} from '@/app/insights/insights-types';

interface InsightsWorkspaceProps {
  questionCatalog: InsightQuestionDefinition[];
  promptSuggestions: string[];
  coverageSummary: {
    totalQuestions: number;
    readyQuestions: number;
    needsMedusaConfigQuestions: number;
    blockedQuestions: number;
  };
  coverageAuditNotes: string[];
  initialSavedViews: InsightSavedView[];
  hasInsightsAccess: boolean;
}

export function InsightsWorkspace({
  questionCatalog,
  promptSuggestions,
  coverageSummary,
  coverageAuditNotes,
  initialSavedViews,
  hasInsightsAccess,
}: InsightsWorkspaceProps) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const [question, setQuestion] = useState(promptSuggestions[0] ?? '');
  const [preferredView, setPreferredView] = useState<InsightAnswerShape | undefined>(undefined);
  const [result, setResult] = useState<InsightQueryResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [savedViews, setSavedViews] = useState(initialSavedViews);
  const [saveName, setSaveName] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const matchedQuestion = result?.coverage.matchedQuestionId
    ? questionCatalog.find(catalogQuestion => catalogQuestion.id === result.coverage.matchedQuestionId) ?? null
    : null;

  async function runQuestion(nextQuestion: string, nextPreferredView: InsightAnswerShape | undefined) {
    if (!nextQuestion.trim()) {
      setRequestError('Enter a question before querying Medusa.');
      return;
    }

    setIsRunning(true);
    setRequestError(null);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/insights/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: nextQuestion,
          preferredView: nextPreferredView,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setResult(null);
        setRequestError(typeof payload?.error === 'string' ? payload.error : 'Unable to run the Medusa query right now.');
        return;
      }

      setResult(payload);
      setQuestion(nextQuestion);
      setPreferredView(nextPreferredView ?? payload?.plan?.answerShape);
    } catch (error) {
      console.error('Insights query failed:', error);
      setResult(null);
      setRequestError('Unable to run the Medusa query right now.');
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSaveView() {
    if (!question.trim()) {
      setSaveMessage('Run or type a question before saving a view.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/insights/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: saveName.trim() || buildDefaultSaveName(question, result),
          question,
          questionId: result?.coverage.matchedQuestionId ?? null,
          preferredView: preferredView ?? result?.plan?.answerShape,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setSaveMessage(typeof payload?.error === 'string' ? payload.error : 'Unable to save this view.');
        return;
      }

      setSavedViews(payload.views ?? []);
      setSaveName('');
      setSaveMessage('Saved view updated.');
    } catch (error) {
      console.error('Saving insights view failed:', error);
      setSaveMessage('Unable to save this view right now.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSavedView(viewId: string) {
    try {
      const response = await fetch('/api/insights/views', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: viewId,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setSaveMessage(typeof payload?.error === 'string' ? payload.error : 'Unable to delete this view.');
        return;
      }

      setSavedViews(payload.views ?? []);
      setSaveMessage('Saved view removed.');
    } catch (error) {
      console.error('Deleting insights view failed:', error);
      setSaveMessage('Unable to delete this view right now.');
    }
  }

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '48px',
      }}
    >
      <section
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          padding: '20px 24px',
          borderRadius: theme.radius.r12,
          border: `1px solid ${businessPalette.blueberryBorder}`,
          background: businessPalette.canvasGradient,
          boxShadow: '0 18px 48px rgba(17, 24, 39, 0.08)',
        }}
      >
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Text
            typography="bodyMedium1"
            color="systemGrayscale60"
            css={{
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Instacart Business Medusa Workspace
          </Text>
          <Text typography="titleLarge">Production-backed recurring questions for PM and sales</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            This workspace only executes the questions that have explicit Medusa coverage in the current app catalog. The rest
            stay visible as coverage gaps so the team can decide what to add upstream.
          </Text>
        </div>

        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <SummaryStatCard label="Catalog questions" value={coverageSummary.totalQuestions} />
          <SummaryStatCard label="Ready now" value={coverageSummary.readyQuestions} tone="positive" />
          <SummaryStatCard label="Need Medusa config" value={coverageSummary.needsMedusaConfigQuestions} tone="caution" />
          <SummaryStatCard label="Blocked outside Medusa" value={coverageSummary.blockedQuestions} tone="neutral" />
        </div>

        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            borderRadius: theme.radius.r12,
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: theme.colors.systemGrayscale00,
          }}
        >
          <Text typography="titleMedium">Ask a catalog-backed question</Text>
          <textarea
            value={question}
            onChange={event => setQuestion(event.target.value)}
            placeholder="How many business deliveries are we doing each week over the last 12 weeks?"
            disabled={!hasInsightsAccess || isRunning}
            css={{
              width: '100%',
              minHeight: '110px',
              resize: 'vertical',
              padding: '14px 16px',
              borderRadius: theme.radius.r12,
              border: `1px solid ${businessPalette.blueberryBorder}`,
              font: 'inherit',
              color: theme.colors.systemGrayscale80,
              backgroundColor: theme.colors.systemGrayscale00,
              outline: 'none',
              '&:focus': {
                borderColor: businessPalette.elderberry,
                boxShadow: `0 0 0 2px ${businessPalette.elderberrySoft}`,
              },
            }}
          />

          <div
            css={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {(['metric', 'table', 'lineChart', 'barChart'] satisfies InsightAnswerShape[]).map(view => (
              <button
                key={view}
                type="button"
                onClick={() => setPreferredView(view)}
                css={{
                  appearance: 'none',
                  border: `1px solid ${preferredView === view ? businessPalette.elderberry : businessPalette.blueberryBorder}`,
                  backgroundColor: preferredView === view ? businessPalette.elderberrySoft : theme.colors.systemGrayscale00,
                  color: theme.colors.systemGrayscale90,
                  borderRadius: '999px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontWeight: 600,
                }}
              >
                {labelForView(view)}
              </button>
            ))}
          </div>

          <div
            css={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {promptSuggestions.map(promptSuggestion => (
              <button
                key={promptSuggestion}
                type="button"
                onClick={() => {
                  setQuestion(promptSuggestion);
                  void runQuestion(promptSuggestion, preferredView);
                }}
                css={{
                  appearance: 'none',
                  border: `1px solid ${businessPalette.blueberryBorder}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.72)',
                  borderRadius: '999px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  font: 'inherit',
                  color: theme.colors.systemGrayscale90,
                }}
              >
                {promptSuggestion}
              </button>
            ))}
          </div>

          {!hasInsightsAccess ? (
            <InlineNotice
              tone="caution"
              message="Insights requires an internal Instacart session cookie before the server will run production-backed Medusa queries."
            />
          ) : null}
          {requestError ? <InlineNotice tone="caution" message={requestError} /> : null}
          {saveMessage ? <InlineNotice tone="neutral" message={saveMessage} /> : null}

          <div
            css={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <PrimaryButtonSmall onPress={() => void runQuestion(question, preferredView)} disabled={!hasInsightsAccess || isRunning}>
              {isRunning ? 'Running query...' : 'Run query'}
            </PrimaryButtonSmall>
            <input
              value={saveName}
              onChange={event => setSaveName(event.target.value)}
              placeholder={buildDefaultSaveName(question, result)}
              disabled={!hasInsightsAccess || isSaving}
              css={{
                minWidth: '260px',
                flex: '1 1 260px',
                minHeight: '40px',
                padding: '0 14px',
                borderRadius: theme.radius.r12,
                border: `1px solid ${businessPalette.blueberryBorder}`,
                font: 'inherit',
                outline: 'none',
              }}
            />
            <SecondaryButtonSmall onPress={handleSaveView} disabled={!hasInsightsAccess || isSaving}>
              {isSaving ? 'Saving...' : 'Save view'}
            </SecondaryButtonSmall>
          </div>
        </div>
      </section>

      <div
        css={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'minmax(0, 1.65fr) minmax(300px, 0.95fr)',
          alignItems: 'start',
        }}
      >
        <section
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {result ? (
            <>
              <ResultSummaryCard result={result} />
              {result.chart ? <InsightsResultChart chart={result.chart} /> : null}
              {result.rows.length > 0 ? <ResultTable columns={result.columns} rows={result.rows} /> : null}
              {result.plan ? (
                <details
                  css={{
                    borderRadius: theme.radius.r12,
                    border: `1px solid ${businessPalette.blueberryBorder}`,
                    backgroundColor: theme.colors.systemGrayscale00,
                    padding: '16px 18px',
                  }}
                >
                  <summary
                    css={{
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Query transparency
                  </summary>
                  <div
                    css={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginTop: '12px',
                    }}
                  >
                    <CodeBlock label="Medusa SQL" value={result.plan.medusaSql ?? 'Unavailable'} />
                    {result.plan.compiledSql ? <CodeBlock label="Compiled SQL" value={result.plan.compiledSql} /> : null}
                  </div>
                </details>
              ) : null}
            </>
          ) : (
            <EmptyStateCard />
          )}
        </section>

        <aside
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <SavedViewsCard
            savedViews={savedViews}
            onDeleteView={viewId => void handleDeleteSavedView(viewId)}
            onLoadView={view => void runQuestion(view.question, view.preferredView)}
          />
          <CatalogCoverageCard auditNotes={coverageAuditNotes} questionCatalog={questionCatalog} matchedQuestionId={matchedQuestion?.id ?? null} />
        </aside>
      </div>
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  tone = 'brand',
}: {
  label: string;
  value: number;
  tone?: 'brand' | 'positive' | 'caution' | 'neutral';
}) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const toneStyles =
    tone === 'positive'
      ? {
          borderColor: 'rgba(16, 185, 129, 0.22)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
        }
      : tone === 'caution'
        ? {
            borderColor: 'rgba(245, 158, 11, 0.22)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
          }
        : tone === 'neutral'
          ? {
              borderColor: theme.colors.systemGrayscale20,
              backgroundColor: theme.colors.systemGrayscale00,
            }
          : {
              borderColor: businessPalette.blueberryBorder,
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
            };

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '14px 16px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${toneStyles.borderColor}`,
        backgroundColor: toneStyles.backgroundColor,
      }}
    >
      <Text typography="titleMedium">{value}</Text>
      <Text typography="bodyRegular" color="systemGrayscale60">
        {label}
      </Text>
    </div>
  );
}

function InlineNotice({ message, tone }: { message: string; tone: 'neutral' | 'caution' }) {
  const theme = useTheme();

  return (
    <div
      css={{
        padding: '12px 14px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${tone === 'caution' ? 'rgba(245, 158, 11, 0.24)' : theme.colors.systemGrayscale20}`,
        backgroundColor: tone === 'caution' ? 'rgba(245, 158, 11, 0.08)' : theme.colors.systemGrayscale00,
      }}
    >
      <Text typography="bodyRegular">{message}</Text>
    </div>
  );
}

function ResultSummaryCard({ result }: { result: InsightQueryResponse }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '18px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${businessPalette.blueberryBorder}`,
        backgroundColor: theme.colors.systemGrayscale00,
      }}
    >
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <Text typography="titleMedium">{result.coverage.matchedQuestionTitle ?? 'Insights result'}</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {result.summary}
          </Text>
        </div>
        <div
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: '999px',
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: businessPalette.blueberrySoft,
          }}
        >
          <Text typography="bodyMedium1">Coverage: {result.coverage.status}</Text>
        </div>
      </div>
      <Text typography="bodyRegular" color="systemGrayscale60">
        {result.coverage.plannerReasoning}
      </Text>
    </div>
  );
}

function ResultTable({ columns, rows }: { columns: InsightTableColumn[]; rows: InsightTableRow[] }) {
  const theme = useTheme();

  return (
    <div
      css={{
        overflow: 'hidden',
        borderRadius: theme.radius.r12,
        border: `1px solid ${theme.colors.systemGrayscale20}`,
        backgroundColor: theme.colors.systemGrayscale00,
      }}
    >
      <div css={{ overflowX: 'auto' }}>
        <table
          css={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  css={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderBottom: `1px solid ${theme.colors.systemGrayscale20}`,
                    backgroundColor: theme.colors.systemGrayscale10,
                  }}
                >
                  <Text typography="bodyEmphasized">{column.label}</Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row.dimension_value ?? 'row'}-${rowIndex}`}>
                {columns.map(column => (
                  <td
                    key={column.id}
                    css={{
                      padding: '12px 16px',
                      borderBottom: rowIndex === rows.length - 1 ? 'none' : `1px solid ${theme.colors.systemGrayscale10}`,
                    }}
                  >
                    <Text typography="bodyRegular">{formatTableValue(row[column.id], column.kind)}</Text>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CodeBlock({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <Text typography="bodyEmphasized">{label}</Text>
      <pre
        css={{
          margin: 0,
          padding: '14px 16px',
          overflowX: 'auto',
          borderRadius: theme.radius.r12,
            backgroundColor: theme.colors.systemGrayscale10,
          whiteSpace: 'pre-wrap',
        }}
      >
        {value}
      </pre>
    </div>
  );
}

function EmptyStateCard() {
  const theme = useTheme();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '24px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${theme.colors.systemGrayscale20}`,
        backgroundColor: theme.colors.systemGrayscale00,
      }}
    >
      <Text typography="titleMedium">Run a starter prompt to validate the Medusa path</Text>
      <Text typography="bodyRegular" color="systemGrayscale60">
        The workspace will return a clear coverage gap whenever the question inventory points to missing Medusa work instead
        of silently improvising unsupported SQL.
      </Text>
    </div>
  );
}

function SavedViewsCard({
  savedViews,
  onDeleteView,
  onLoadView,
}: {
  savedViews: InsightSavedView[];
  onDeleteView: (viewId: string) => void;
  onLoadView: (view: InsightSavedView) => void;
}) {
  const theme = useTheme();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '18px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${theme.colors.systemGrayscale20}`,
        backgroundColor: theme.colors.systemGrayscale00,
      }}
    >
      <Text typography="titleMedium">Saved views</Text>
      {savedViews.length === 0 ? (
        <Text typography="bodyRegular" color="systemGrayscale60">
          Save a few recurring prompts here. Views are stored in the Next.js backend cookie route for this session.
        </Text>
      ) : (
        savedViews.map(savedView => (
          <div
            key={savedView.id}
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: theme.radius.r12,
              border: `1px solid ${theme.colors.systemGrayscale20}`,
            }}
          >
            <Text typography="bodyEmphasized">{savedView.name}</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              {savedView.question}
            </Text>
            <div
              css={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => onLoadView(savedView)}
                css={{
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: theme.colors.brandHighlightRegular,
                  cursor: 'pointer',
                  font: 'inherit',
                  padding: 0,
                }}
              >
                Reload
              </button>
              <button
                type="button"
                onClick={() => onDeleteView(savedView.id)}
                css={{
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: '#B91C1C',
                  cursor: 'pointer',
                  font: 'inherit',
                  padding: 0,
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CatalogCoverageCard({
  auditNotes,
  questionCatalog,
  matchedQuestionId,
}: {
  auditNotes: string[];
  questionCatalog: InsightQuestionDefinition[];
  matchedQuestionId: string | null;
}) {
  const theme = useTheme();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '18px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${theme.colors.systemGrayscale20}`,
        backgroundColor: theme.colors.systemGrayscale00,
      }}
    >
      <Text typography="titleMedium">Coverage audit</Text>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {auditNotes.map(note => (
          <Text key={note} typography="bodyRegular" color="systemGrayscale60">
            {note}
          </Text>
        ))}
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {questionCatalog.map(question => (
          <div
            key={question.id}
            css={{
              padding: '12px 14px',
              borderRadius: theme.radius.r12,
              border: `1px solid ${
                matchedQuestionId === question.id ? theme.colors.brandHighlightRegular : theme.colors.systemGrayscale20
              }`,
              backgroundColor: matchedQuestionId === question.id ? 'rgba(43, 120, 198, 0.06)' : theme.colors.systemGrayscale00,
            }}
          >
            <div
              css={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <Text typography="bodyEmphasized">{question.title}</Text>
              <Text typography="bodyMedium1" color="systemGrayscale60">
                {question.coverageStatus}
              </Text>
            </div>
            <Text typography="bodyRegular" color="systemGrayscale60">
              {question.prompt}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildDefaultSaveName(question: string, result: InsightQueryResponse | null) {
  return (result?.coverage.matchedQuestionTitle || question || 'Saved insight view').slice(0, 60);
}

function labelForView(view: InsightAnswerShape) {
  switch (view) {
    case 'metric':
      return 'Metric';
    case 'table':
      return 'Table';
    case 'lineChart':
      return 'Trend';
    case 'barChart':
      return 'Breakdown';
  }
}

function formatTableValue(value: InsightTableRow[keyof InsightTableRow], kind: InsightTableColumn['kind']) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (kind === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value);
  }

  return String(value);
}
