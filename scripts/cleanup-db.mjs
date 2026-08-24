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

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);
const mode = process.argv.includes('--purge-fabricated')
  ? 'purge'
  : process.argv.includes('--purge-orphans')
    ? 'purge-orphans'
    : 'list';

const FABRICATED_SUBTITLE = 'Collaborative repository connected via access token';

const CHILD_TABLES = [
  'tasks',
  'standups',
  'revisions',
  'team_members',
  'milestone_phases',
  'phase_deliverables',
  'activity_logs'
];

const listProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, subtitle, created_at')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('List failed:', error.message);
    process.exit(1);
  }
  return data || [];
};

const deleteProjectCascade = async projectId => {
  const { data: tasks } = await supabase.from('tasks').select('id').eq('project_id', projectId);
  const taskIds = (tasks || []).map(t => t.id);
  if (taskIds.length > 0) {
    const { error } = await supabase.from('subtasks').delete().in('task_id', taskIds);
    if (error) console.warn(`  subtasks: ${error.message}`);
  }
  for (const table of CHILD_TABLES) {
    const { error } = await supabase.from(table).delete().eq('project_id', projectId);
    if (error) console.warn(`  ${table}: ${error.message}`);
  }
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) console.warn(`  projects: ${error.message}`);
};

const projects = await listProjects();

console.log(`\n=== Supabase projects (${projects.length}) ===`);
for (const p of projects) {
  const fabricated = (p.subtitle || '').startsWith(FABRICATED_SUBTITLE);
  console.log(
    `${fabricated ? '[FABRICATED]' : '[          ]'} ${p.id}  "${p.title}"  ${p.created_at || ''}`
  );
}

if (mode === 'purge') {
  const doomed = projects.filter(p => (p.subtitle || '').startsWith(FABRICATED_SUBTITLE));
  console.log(`\nPurging ${doomed.length} fabricated project(s)...`);
  for (const p of doomed) {
    console.log(`Deleting ${p.id} "${p.title}"`);
    await deleteProjectCascade(p.id);
  }
  console.log('Done.');
} else if (mode === 'purge-orphans') {
  const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    console.error(`Refusing: ${count} project rows still exist. Orphan purge only safe when projects table is empty.`);
    process.exit(1);
  }
  console.log('\nProjects table empty — purging orphaned child rows...');
  for (const table of [...CHILD_TABLES, 'subtasks']) {
    const { error } = await supabase.from(table).delete().neq('id', '__none__');
    console.log(`  ${table}: ${error ? 'ERR ' + error.message : 'cleared'}`);
  }
  console.log('Done.');
} else {
  console.log('\nRun with --purge-fabricated to delete the [FABRICATED] rows (cascades children).');
  console.log('Run with --purge-orphans to clear orphaned child rows when projects table is empty.');
}
