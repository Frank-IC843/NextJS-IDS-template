'use client';

import { useTheme } from '@instacart/ids-core';
import {
  ModalAutosize,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SecondaryButtonSmall,
  Text,
  useModalState,
} from '@instacart/ids-customers';
import { useEffect } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import type { DashboardWidgetDraft, SavedDashboardSummary } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';

interface DashboardLibraryModalProps {
  isOpen: boolean;
  widgets: DashboardWidgetDraft[];
  saveName: string;
  savedDashboards: SavedDashboardSummary[];
  isSavingDashboard: boolean;
  loadingDashboardId: string | null;
  onSaveNameChange: (value: string) => void;
  onSaveDashboard: () => void;
  onLoadDashboardRequest: (dashboard: SavedDashboardSummary) => void;
  onClose: () => void;
}

export function DashboardLibraryModal({
  isOpen,
  widgets,
  saveName,
  savedDashboards,
  isSavingDashboard,
  loadingDashboardId,
  onSaveNameChange,
  onSaveDashboard,
  onLoadDashboardRequest,
  onClose,
}: DashboardLibraryModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <DashboardLibraryModalInner
      widgets={widgets}
      saveName={saveName}
      savedDashboards={savedDashboards}
      isSavingDashboard={isSavingDashboard}
      loadingDashboardId={loadingDashboardId}
      onSaveNameChange={onSaveNameChange}
      onSaveDashboard={onSaveDashboard}
      onLoadDashboardRequest={onLoadDashboardRequest}
      onClose={onClose}
    />
  );
}

type DashboardLibraryModalInnerProps = Omit<DashboardLibraryModalProps, 'isOpen'>;

function DashboardLibraryModalInner({
  widgets,
  saveName,
  savedDashboards,
  isSavingDashboard,
  loadingDashboardId,
  onSaveNameChange,
  onSaveDashboard,
  onLoadDashboardRequest,
  onClose,
}: DashboardLibraryModalInnerProps) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const modal = useModalState({ visible: true });
  const accessibleLabels = { close: 'Close dashboard library' };
  const isBusy = isSavingDashboard || loadingDashboardId !== null;

  useEffect(() => {
    if (!modal.visible) {
      onClose();
    }
  }, [modal.visible, onClose]);

  return (
    <ModalAutosize modal={modal} isMounted hideOnClickOutside={!isBusy} hideOnEsc={!isBusy}>
      <div
        css={{
          width: 'min(760px, calc(100vw - 32px))',
          maxWidth: '100%',
        }}
      >
        <ModalHeader hide={modal.hide} accessibleLabels={accessibleLabels} onClick={modal.hide} disabled={isBusy}>
          <ModalTitle>Dashboard library</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: 'min(620px, calc(100vh - 220px))',
            }}
          >
            <div
              css={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '4px 0 2px',
              }}
            >
              <Text typography="bodyRegular" color="systemGrayscale60">
                Save the current widget canvas locally, then reopen it later from history without bloating the main hero.
              </Text>
            </div>

            <section
              css={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: theme.radius.r12,
                border: `1px solid ${businessPalette.elderberryBorder}`,
                background: 'linear-gradient(180deg, rgba(110, 72, 229, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)',
              }}
            >
              <div css={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Text typography="bodyEmphasized">Save current dashboard</Text>
                <Text typography="bodyMedium1" color="systemGrayscale60">
                  {widgets.length === 0
                    ? 'Add at least one widget to save a reusable dashboard.'
                    : `This canvas currently has ${widgets.length} widget${widgets.length === 1 ? '' : 's'}.`}
                </Text>
              </div>

              <div
                css={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  '@media (min-width: 768px)': {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                }}
              >
                <input
                  value={saveName}
                  onChange={event => onSaveNameChange(event.target.value)}
                  placeholder={buildDashboardSavePlaceholder()}
                  disabled={widgets.length === 0 || isSavingDashboard}
                  css={{
                    minHeight: '42px',
                    width: '100%',
                    padding: '0 14px',
                    borderRadius: theme.radius.r12,
                    border: `1px solid ${businessPalette.blueberryBorder}`,
                    backgroundColor: theme.colors.systemGrayscale00,
                    color: theme.colors.systemGrayscale90,
                    font: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                    '&:focus': {
                      borderColor: businessPalette.blueberry,
                      boxShadow: `0 0 0 3px ${businessPalette.blueberrySoft}`,
                    },
                    '&::placeholder': {
                      color: theme.colors.systemGrayscale50,
                    },
                    '@media (min-width: 768px)': {
                      flex: '1 1 auto',
                    },
                  }}
                />
                <PrimaryButtonSmall onClick={onSaveDashboard} disabled={widgets.length === 0 || isSavingDashboard}>
                  {isSavingDashboard ? 'Saving...' : 'Save dashboard'}
                </PrimaryButtonSmall>
              </div>
            </section>

            <section
              css={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: 0,
              }}
            >
              <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div css={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Text typography="bodyEmphasized">Saved dashboards</Text>
                  <Text typography="bodyMedium1" color="systemGrayscale60">
                    {savedDashboards.length === 0
                      ? 'No saved dashboards yet.'
                      : `${savedDashboards.length} local dashboard${savedDashboards.length === 1 ? '' : 's'} available.`}
                  </Text>
                </div>
              </div>

              {savedDashboards.length === 0 ? (
                <div
                  css={{
                    padding: '16px',
                    borderRadius: theme.radius.r12,
                    border: `1px dashed ${businessPalette.blueberryBorder}`,
                    backgroundColor: 'rgba(255, 255, 255, 0.72)',
                  }}
                >
                  <Text typography="bodyMedium1" color="systemGrayscale60">
                    Save a canvas to start a local dashboard history.
                  </Text>
                </div>
              ) : (
                <ul
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: 0,
                    margin: 0,
                    listStyle: 'none',
                    maxHeight: '360px',
                    overflowY: 'auto',
                  }}
                >
                  {savedDashboards.map(dashboard => (
                    <li key={dashboard.id}>
                      <article
                        css={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          padding: '14px',
                          borderRadius: theme.radius.r12,
                          border: `1px solid ${businessPalette.blueberryBorder}`,
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        }}
                      >
                        <div css={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <Text typography="bodyEmphasized">{dashboard.name}</Text>
                          <div
                            css={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <Text typography="bodyMedium1" color="systemGrayscale60">
                              Saved {formatSavedDashboardTimestamp(dashboard.updatedAt)}
                            </Text>
                            <div
                              css={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '5px 8px',
                                borderRadius: '999px',
                                border: `1px solid ${businessPalette.blueberryBorder}`,
                                backgroundColor: theme.colors.systemGrayscale00,
                              }}
                            >
                              <Text typography="bodyMedium1" color="systemGrayscale60">
                                {dashboard.widgetCount} widget{dashboard.widgetCount === 1 ? '' : 's'}
                              </Text>
                            </div>
                          </div>
                        </div>

                        <div css={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <SecondaryButtonSmall
                            onClick={() => onLoadDashboardRequest(dashboard)}
                            disabled={loadingDashboardId === dashboard.id}
                          >
                            {loadingDashboardId === dashboard.id ? 'Loading...' : 'Load dashboard'}
                          </SecondaryButtonSmall>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </ModalContent>
        <ModalFooter>
          <div css={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
            <SecondaryButtonSmall onClick={modal.hide} disabled={isBusy}>
              Close
            </SecondaryButtonSmall>
          </div>
        </ModalFooter>
      </div>
    </ModalAutosize>
  );
}

function buildDashboardSavePlaceholder() {
  const now = new Date();

  return `Dashboard ${now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function formatSavedDashboardTimestamp(isoTimestamp: string) {
  return new Date(isoTimestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
