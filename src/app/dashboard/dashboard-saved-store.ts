import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  MAX_SAVED_DASHBOARD_HISTORY,
  savedDashboardSchema,
  savedDashboardSummarySchema,
  type DashboardSaveInput,
  type SavedDashboard,
  type SavedDashboardSummary,
} from '@/app/dashboard/dashboard-builder-types';

const DASHBOARD_STORAGE_DIRECTORY = path.join(process.cwd(), '.dashboard-saves');
const DASHBOARD_STORAGE_PATH = path.join(DASHBOARD_STORAGE_DIRECTORY, 'saved-dashboards.json');

export async function listSavedDashboards(): Promise<SavedDashboardSummary[]> {
  const dashboards = await readSavedDashboardEntries();

  return dashboards.map(buildSavedDashboardSummary);
}

export async function getSavedDashboard(dashboardId: string): Promise<SavedDashboard | null> {
  const dashboards = await readSavedDashboardEntries();

  return dashboards.find(dashboard => dashboard.id === dashboardId) ?? null;
}

export async function saveDashboard(input: DashboardSaveInput): Promise<SavedDashboard> {
  const dashboards = await readSavedDashboardEntries();
  const now = new Date().toISOString();
  const trimmedName = input.name?.trim();
  const nextDashboard: SavedDashboard = savedDashboardSchema.parse({
    id: `dashboard-${crypto.randomUUID().slice(0, 8)}`,
    name: trimmedName && trimmedName.length > 0 ? trimmedName : buildDefaultDashboardName(now),
    createdAt: now,
    updatedAt: now,
    widgets: input.widgets,
  });
  const nextDashboards = [nextDashboard, ...dashboards].slice(0, MAX_SAVED_DASHBOARD_HISTORY);

  await writeSavedDashboardEntries(nextDashboards);

  return nextDashboard;
}

function buildSavedDashboardSummary(dashboard: SavedDashboard): SavedDashboardSummary {
  return savedDashboardSummarySchema.parse({
    id: dashboard.id,
    name: dashboard.name,
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt,
    widgetCount: dashboard.widgets.length,
  });
}

async function readSavedDashboardEntries(): Promise<SavedDashboard[]> {
  try {
    const fileContents = await readFile(DASHBOARD_STORAGE_PATH, 'utf8');
    const parsedValue = JSON.parse(fileContents);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(entry => savedDashboardSchema.safeParse(entry))
      .filter((result): result is { success: true; data: SavedDashboard } => result.success)
      .map(result => result.data)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }

    console.error('Unable to read saved dashboards from local storage:', error);
    return [];
  }
}

async function writeSavedDashboardEntries(dashboards: SavedDashboard[]) {
  await mkdir(DASHBOARD_STORAGE_DIRECTORY, { recursive: true });
  await writeFile(DASHBOARD_STORAGE_PATH, JSON.stringify(dashboards, null, 2), 'utf8');
}

function buildDefaultDashboardName(isoTimestamp: string) {
  const date = new Date(isoTimestamp);

  return `Dashboard ${date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function isMissingFileError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
