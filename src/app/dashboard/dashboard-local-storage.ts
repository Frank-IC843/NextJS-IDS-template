import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PersistedDashboardLayout } from '@/app/dashboard/dashboard-builder-types';

const DASHBOARD_STORAGE_DIRECTORY = path.join(process.cwd(), '.data');
const DASHBOARD_STORAGE_FILE = path.join(DASHBOARD_STORAGE_DIRECTORY, 'business-dashboard-layout.json');

export async function readLocalDashboardLayout(): Promise<unknown | null> {
  try {
    const fileContents = await readFile(DASHBOARD_STORAGE_FILE, 'utf8');
    return JSON.parse(fileContents) as unknown;
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

export async function writeLocalDashboardLayout(layout: PersistedDashboardLayout): Promise<void> {
  await mkdir(DASHBOARD_STORAGE_DIRECTORY, { recursive: true });
  await writeFile(DASHBOARD_STORAGE_FILE, JSON.stringify(layout, null, 2), 'utf8');
}

function isFileNotFoundError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
