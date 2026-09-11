import path from 'node:path';

export function defaultWorkspaceRoot(): string {
  return process.env.MARKETIYO_WORKSPACE ?? path.join(process.cwd(), 'workspace');
}

export const workspaceFiles = {
  brand: 'brand.json',
  ideas: 'ideas.json',
  calendar: 'calendar.json',
  settings: 'settings.local.json',
  expansions: 'expansions',
  campaigns: 'campaigns.json',
  campaignDocs: 'campaigns',
} as const;
