import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(line => line.includes('=') && !line.trim().startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

for (const table of ['tasks', 'team_members', 'milestone_phases', 'standups', 'revisions', 'activity_logs', 'subtasks', 'threads', 'capstone_integration_deliveries']) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  console.log(table.padEnd(32), error ? `ERR: ${error.message}` : count);
}
