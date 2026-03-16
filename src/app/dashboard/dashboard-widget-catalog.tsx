'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { useDashboardPromptComposerStyles } from '@/app/dashboard/dashboard-prompt-composer.styles';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetTypePreview } from '@/app/dashboard/dashboard-widget-type-preview';

interface DashboardWidgetCatalogProps {
  supportedWidgets: SupportedWidgetDefinition[];
  selectedWidgetTypes: SupportedWidgetDefinition['type'][];
  onWidgetTypeToggle: (widgetType: SupportedWidgetDefinition['type']) => void;
}

export function DashboardWidgetCatalog({
  supportedWidgets,
  selectedWidgetTypes,
  onWidgetTypeToggle,
}: DashboardWidgetCatalogProps) {
  const styles = useDashboardPromptComposerStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <div css={styles.widgetTypePanel}>
      <div css={styles.sectionHeader}>
        <div css={styles.section}>
          <Text typography="bodyEmphasized">Widget types the AI can use</Text>
          <Text typography="bodySmall1" css={styles.helperText}>
            Select one or more widget types. The AI will stay within this set when generating the widget.
          </Text>
        </div>
        <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
          {selectedWidgetTypes.length} of {supportedWidgets.length} enabled
        </Text>
      </div>

      <div css={styles.widgetCatalog}>
        {supportedWidgets.map(widget => {
          const isSelected = selectedWidgetTypes.includes(widget.type);

          return (
            <button
              type="button"
              key={widget.type}
              onClick={() => onWidgetTypeToggle(widget.type)}
              aria-pressed={isSelected}
              css={{
                ...styles.widgetOption,
                ...(isSelected ? styles.widgetOptionSelected : {}),
              }}
            >
              <div css={styles.widgetPreviewSurface}>
                <DashboardWidgetTypePreview widgetType={widget.type} />
              </div>
              <div css={styles.widgetOptionHeader}>
                <div css={styles.widgetOptionText}>
                  <Text typography="bodyEmphasized">{widget.label}</Text>
                  <Text typography="bodySmall1" css={styles.helperText}>
                    {widget.promptHint}
                  </Text>
                </div>
                <div
                  css={{
                    ...styles.widgetOptionStatus,
                    ...(isSelected ? styles.widgetOptionStatusSelected : {}),
                  }}
                >
                  <Text
                    typography="bodySmall1"
                    css={{ color: isSelected ? businessPalette.elderberryDark : businessPalette.blueberryDark }}
                  >
                    {isSelected ? 'Enabled' : 'Off'}
                  </Text>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedWidgetTypes.length === 0 ? (
        <Text typography="bodySmall1" css={styles.warningText}>
          Select at least one widget type to continue.
        </Text>
      ) : null}
    </div>
  );
}
