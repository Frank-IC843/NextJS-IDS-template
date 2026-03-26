'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { useState } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { InsightsResultChart } from '@/app/insights/insights-result-chart';
import {
  insightQueryResponseSchema,
  type InsightCoverageStatus,
  type InsightQueryResponse,
  type InsightTableColumn,
  type InsightTableRow,
  type InsightTableRowValue,
} from '@/app/insights/insights-types';

interface AssistantWorkspaceProps {
  promptSuggestions: string[];
}

type MetricCard = {
  id: string;
  label: string;
  value: string;
};

export function AssistantWorkspace({ promptSuggestions }: AssistantWorkspaceProps) {
  const styles = useStyles();
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [response, setResponse] = useState<InsightQueryResponse | null>(null);

  async function runQuestion(rawQuestion: string) {
    const trimmedQuestion = rawQuestion.trim();

    if (!trimmedQuestion) {
      setErrorMessage('Enter a business question before asking the assistant.');
      return;
    }

    setQuestion(trimmedQuestion);
    setSubmittedQuestion(trimmedQuestion);
    setErrorMessage(null);
    setResponse(null);
    setIsRunning(true);

    try {
      const apiResponse = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });
      const payload = await apiResponse.json().catch(() => null);

      if (!apiResponse.ok) {
        setErrorMessage(typeof payload?.error === 'string' ? payload.error : 'Unable to answer that question right now.');
        return;
      }

      const parsedPayload = insightQueryResponseSchema.safeParse(payload);

      if (!parsedPayload.success) {
        setErrorMessage('The assistant returned an invalid Medusa response shape.');
        return;
      }

      setResponse(parsedPayload.data);
    } catch (error) {
      console.error('[assistant-workspace] Medusa request failed:', error);
      setErrorMessage('Unable to answer that question right now.');
    } finally {
      setIsRunning(false);
    }
  }

  const metricCards = response ? buildMetricCards(response) : [];

  return (
    <div css={styles.page}>
      <section css={styles.heroCard}>
        <div css={styles.heroGrid}>
          <div css={styles.heroCopy}>
            <Text typography="bodyEmphasized" css={styles.eyebrow}>
              Medusa-backed assistant
            </Text>
            <Text typography="headline">Ask one question and run it through the Next.js backend.</Text>
            <Text typography="bodyRegular" color="systemGrayscale70" css={styles.heroDescription}>
              This workspace matches your question to an approved Medusa-backed query, executes it server-side, and returns
              the summary, result set, and query context in one place.
            </Text>
            <div css={styles.capabilityRow}>
              <CapabilityPill label="Medusa RPC + SQL path" />
              <CapabilityPill label="Read-only backend execution" />
              <CapabilityPill label="Coverage-aware answers" />
            </div>
          </div>

          <form
            css={styles.composerCard}
            onSubmit={event => {
              event.preventDefault();
              void runQuestion(question);
            }}
          >
            <label css={styles.composerLabel} htmlFor="assistant-question">
              Ask a Medusa-backed business question
            </label>
            <textarea
              id="assistant-question"
              value={question}
              onChange={event => {
                setQuestion(event.target.value);
                setErrorMessage(null);
              }}
              rows={5}
              placeholder="How many business deliveries happened in the last 30 days?"
              css={styles.textarea}
              disabled={isRunning}
            />
            <div css={styles.composerFooter}>
              <Text typography="bodyMedium1" color="systemGrayscale60">
                {isRunning
                  ? `Running: ${submittedQuestion}`
                  : 'Only questions with approved Medusa coverage will execute end-to-end.'}
              </Text>
              <PrimaryButtonSmall type="submit" disabled={isRunning}>
                {isRunning ? 'Querying Medusa...' : 'Ask assistant'}
              </PrimaryButtonSmall>
            </div>
          </form>
        </div>

        <div css={styles.suggestionRow}>
          {promptSuggestions.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              css={styles.suggestionButton}
              disabled={isRunning}
              onClick={() => void runQuestion(suggestion)}
            >
              <Text typography="bodyMedium1">{suggestion}</Text>
            </button>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <section css={styles.noticeCard}>
          <Text typography="bodyEmphasized">Assistant unavailable</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {errorMessage}
          </Text>
        </section>
      ) : null}

      {response && response.coverage.status !== 'ready' ? (
        <section css={styles.warningCard}>
          <Text typography="bodyEmphasized">{getCoverageTitle(response.coverage.status)}</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {response.coverage.message}
          </Text>
        </section>
      ) : null}

      {isRunning ? (
        <section css={styles.loadingSection}>
          <LoadingCard />
          <LoadingCard />
        </section>
      ) : null}

      {response ? (
        <>
          <section css={styles.answerGrid}>
            <article css={styles.answerCard}>
              <Text typography="bodyEmphasized" css={styles.answerEyebrow}>
                Latest answer
              </Text>
              <Text typography="titleLarge">{response.coverage.matchedQuestionTitle ?? 'Business insight'}</Text>
              <Text typography="bodyRegular" color="systemGrayscale70" css={styles.answerBody}>
                {response.summary}
              </Text>
              <div css={styles.answerMetaRow}>
                <InfoCard label="Question asked" value={submittedQuestion || question || 'Unknown question'} />
                <InfoCard label="Coverage status" value={humanizeLabel(response.coverage.status)} />
                <InfoCard label="Matched rows" value={String(response.rows.length)} />
              </div>
            </article>

            <article css={styles.contextCard}>
              <div css={styles.contextHeader}>
                <Text typography="bodyEmphasized" css={styles.answerEyebrow}>
                  Query context
                </Text>
                <StatusPill status={response.coverage.status} />
              </div>

              <div css={styles.contextBody}>
                <SemanticField
                  label="Matched question"
                  value={response.coverage.matchedQuestionTitle ?? 'No safe Medusa-backed question match'}
                />
                <SemanticField label="Coverage message" value={response.coverage.message} />
                <SemanticField label="Planner reasoning" value={response.coverage.plannerReasoning} />

                {response.plan ? (
                  <>
                    <SemanticField label="Answer shape" value={humanizeLabel(response.plan.answerShape)} />
                    <SemanticField label="Relative range" value={humanizeLabel(response.plan.relativeRange)} />
                    <SemanticField label="Time bucket" value={humanizeLabel(response.plan.timeBucket)} />
                    <SemanticField label="Metrics" value={response.plan.metricIds.join(', ')} />
                    <SemanticField label="Dimension" value={response.plan.dimensionId ?? 'None'} />

                    {response.plan.medusaSql ? (
                      <details css={styles.sqlDetails}>
                        <summary css={styles.sqlSummary}>
                          <Text typography="bodyEmphasized">Medusa SQL</Text>
                        </summary>
                        <pre css={styles.sqlBlock}>{response.plan.medusaSql}</pre>
                      </details>
                    ) : null}

                    {response.plan.compiledSql ? (
                      <details css={styles.sqlDetails}>
                        <summary css={styles.sqlSummary}>
                          <Text typography="bodyEmphasized">Compiled SQL</Text>
                        </summary>
                        <pre css={styles.sqlBlock}>{response.plan.compiledSql}</pre>
                      </details>
                    ) : null}
                  </>
                ) : (
                  <Text typography="bodyRegular" color="systemGrayscale60">
                    No executable Medusa plan was returned for this question.
                  </Text>
                )}
              </div>
            </article>
          </section>

          <section css={styles.resultsSection}>
            <div css={styles.resultsHeader}>
              <Text typography="titleMedium">Results</Text>
              <Text typography="bodyRegular" color="systemGrayscale60">
                Medusa returns a normalized summary plus structured rows so the UI can render metric cards, charts, and tables
                from the same backend response.
              </Text>
            </div>

            {metricCards.length > 0 ? (
              <div css={styles.metricGrid}>
                {metricCards.map(metricCard => (
                  <article key={metricCard.id} css={styles.metricCard}>
                    <Text typography="bodyMedium1" color="systemGrayscale60">
                      {metricCard.label}
                    </Text>
                    <Text typography="headline">{metricCard.value}</Text>
                  </article>
                ))}
              </div>
            ) : null}

            {response.chart ? <InsightsResultChart chart={response.chart} /> : null}

            {response.rows.length > 0 ? (
              <ResultsTable columns={response.columns} rows={response.rows} />
            ) : (
              <section css={styles.emptyResultsCard}>
                <Text typography="bodyEmphasized">No rows returned</Text>
                <Text typography="bodyRegular" color="systemGrayscale60">
                  The Medusa query completed, but the selected time range and filters did not return any matching rows.
                </Text>
              </section>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function ResultsTable({
  columns,
  rows,
}: {
  columns: InsightTableColumn[];
  rows: InsightTableRow[];
}) {
  const styles = useStyles();

  return (
    <section css={styles.tableCard}>
      <div css={styles.tableHeader}>
        <Text typography="titleMedium">Result table</Text>
        <Text typography="bodyRegular" color="systemGrayscale60">
          {rows.length} row{rows.length === 1 ? '' : 's'}
        </Text>
      </div>

      <div css={styles.tableScroll}>
        <table css={styles.table}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.id} css={styles.tableHeaderCell}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${String(row.dimension_value ?? 'row')}`}>
                {columns.map(column => (
                  <td key={column.id} css={styles.tableCell}>
                    {formatCellValue(row[column.id], column.kind)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CapabilityPill({ label }: { label: string }) {
  const styles = useStyles();

  return (
    <div css={styles.capabilityPill}>
      <Text typography="bodyMedium1">{label}</Text>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  const styles = useStyles();

  return (
    <div css={styles.infoCard}>
      <Text typography="bodyMedium1" color="systemGrayscale60">
        {label}
      </Text>
      <Text typography="bodyEmphasized">{value}</Text>
    </div>
  );
}

function LoadingCard() {
  const styles = useStyles();

  return <div css={styles.loadingCard} aria-hidden="true" />;
}

function SemanticField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text typography="bodyMedium1" color="systemGrayscale60">
        {label}
      </Text>
      <Text typography="bodyRegular">{value}</Text>
    </div>
  );
}

function StatusPill({ status }: { status: InsightCoverageStatus }) {
  const styles = useStyles();

  return (
    <div
      css={{
        ...styles.statusPill,
        ...(status === 'ready'
          ? styles.statusPillReady
          : status === 'needs_medusa_config'
            ? styles.statusPillNeedsConfig
            : styles.statusPillBlocked),
      }}
    >
      <Text typography="bodyMedium1">{humanizeLabel(status)}</Text>
    </div>
  );
}

function buildMetricCards(response: InsightQueryResponse): MetricCard[] {
  const hasDimensionColumn = response.columns.some(column => column.id === 'dimension_value');
  const firstRow = response.rows[0];

  if (hasDimensionColumn || !firstRow) {
    return [];
  }

  return response.columns
    .filter(column => column.kind === 'number')
    .map(column => ({
      id: column.id,
      label: column.label,
      value: formatCellValue(firstRow[column.id], column.kind),
    }));
}

function formatCellValue(value: InsightTableRowValue | undefined, kind: InsightTableColumn['kind']) {
  if (value === null || value === undefined) {
    return 'No data';
  }

  if (kind === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
    }).format(value);
  }

  if (kind === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsedDate = new Date(`${value}T00:00:00Z`);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  return String(value);
}

function getCoverageTitle(status: InsightCoverageStatus) {
  switch (status) {
    case 'needs_medusa_config':
      return 'Needs Medusa coverage';
    case 'blocked':
      return 'Blocked outside Medusa';
    case 'ready':
    default:
      return 'Coverage status';
  }
}

function humanizeLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function useStyles() {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return {
    page: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingBottom: '48px',
    },
    heroCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      padding: '20px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: businessPalette.canvasGradient,
      boxShadow: '0 18px 48px rgba(17, 24, 39, 0.08)',
    },
    heroGrid: {
      display: 'grid',
      gap: '16px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 440px)',
        alignItems: 'start',
      },
    },
    heroCopy: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '760px',
    },
    eyebrow: {
      color: businessPalette.elderberryDark,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    heroDescription: {
      maxWidth: '700px',
    },
    capabilityRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '10px',
      paddingTop: '4px',
    },
    capabilityPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    composerCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)',
    },
    composerLabel: {
      color: theme.colors.systemGrayscale80,
      fontWeight: 600,
    },
    textarea: {
      width: '100%',
      minHeight: '140px',
      padding: '14px 16px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${theme.colors.systemGrayscale30}`,
      backgroundColor: theme.colors.systemGrayscale00,
      color: theme.colors.systemGrayscale80,
      font: 'inherit',
      resize: 'vertical' as const,
      outline: 'none',
      '&:focus': {
        borderColor: businessPalette.elderberry,
        boxShadow: `0 0 0 3px ${businessPalette.elderberrySoft}`,
      },
      '&:disabled': {
        backgroundColor: theme.colors.systemGrayscale10,
        cursor: 'not-allowed',
      },
    },
    composerFooter: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      [responsive.up('r')]: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
    suggestionRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '10px',
    },
    suggestionButton: {
      appearance: 'none' as const,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 14px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: 'rgba(255, 255, 255, 0.84)',
      color: theme.colors.systemGrayscale80,
      cursor: 'pointer',
      transition: 'transform 0.16s ease, box-shadow 0.16s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 20px rgba(17, 24, 39, 0.08)',
      },
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.65,
      },
    },
    noticeCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '16px 18px',
      borderRadius: theme.radius.r12,
      border: `1px solid rgba(195, 57, 57, 0.22)`,
      backgroundColor: 'rgba(195, 57, 57, 0.05)',
    },
    warningCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '16px 18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: businessPalette.elderberrySoft,
    },
    loadingSection: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    loadingCard: {
      minHeight: '220px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background:
        'linear-gradient(135deg, rgba(110, 72, 229, 0.08) 0%, rgba(43, 120, 198, 0.05) 38%, rgba(255, 255, 255, 0.98) 100%)',
    },
    answerGrid: {
      display: 'grid',
      gap: '16px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
        alignItems: 'start',
      },
    },
    answerCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      padding: '20px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 18px 40px rgba(17, 24, 39, 0.06)',
    },
    answerEyebrow: {
      color: businessPalette.elderberryDark,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    answerBody: {
      lineHeight: 1.6,
    },
    answerMetaRow: {
      display: 'grid',
      gap: '10px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
    },
    infoCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '12px 14px',
      borderRadius: theme.radius.r12,
      backgroundColor: theme.colors.systemGrayscale10,
    },
    contextCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 18px 40px rgba(17, 24, 39, 0.06)',
    },
    contextHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    contextBody: {
      display: 'grid',
      gap: '10px',
    },
    statusPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      whiteSpace: 'nowrap' as const,
    },
    statusPillReady: {
      backgroundColor: 'rgba(17, 142, 80, 0.10)',
      color: '#118E50',
    },
    statusPillNeedsConfig: {
      backgroundColor: 'rgba(169, 117, 16, 0.10)',
      color: '#8A5F0A',
    },
    statusPillBlocked: {
      backgroundColor: 'rgba(195, 57, 57, 0.10)',
      color: '#C33939',
    },
    sqlDetails: {
      borderRadius: theme.radius.r12,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale10,
      overflow: 'hidden' as const,
    },
    sqlSummary: {
      padding: '12px 14px',
      cursor: 'pointer',
      listStyle: 'none',
      '&::-webkit-details-marker': {
        display: 'none',
      },
    },
    sqlBlock: {
      margin: 0,
      padding: '0 14px 14px',
      overflowX: 'auto' as const,
      whiteSpace: 'pre' as const,
      color: theme.colors.systemGrayscale80,
      fontSize: '12px',
      lineHeight: 1.5,
    },
    resultsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    resultsHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    metricGrid: {
      display: 'grid',
      gap: '12px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
    },
    metricCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)',
    },
    tableCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)',
    },
    tableHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    tableScroll: {
      overflowX: 'auto' as const,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      minWidth: '560px',
    },
    tableHeaderCell: {
      textAlign: 'left' as const,
      padding: '10px 12px',
      color: theme.colors.systemGrayscale60,
      fontSize: '12px',
      fontWeight: 600,
      borderBottom: `1px solid ${theme.colors.systemGrayscale20}`,
      whiteSpace: 'nowrap' as const,
    },
    tableCell: {
      padding: '12px',
      borderBottom: `1px solid ${theme.colors.systemGrayscale10}`,
      color: theme.colors.systemGrayscale80,
      verticalAlign: 'top' as const,
    },
    emptyResultsCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)',
    },
  } as const;
}
