import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const errors = [];
const protectedOriginals = [
  'poster.html',
  'web.html',
  'latex_code_based.html',
  'excersizes_based_on_user_choice.html',
  'complex_web_handook_based_on_users_choice.html',
  'hometask.html'
];
const staticAddedPages = [
  'agentkit-review.html',
  'agentkit-fix.html',
  'agentkit-architecture.html'
];
const workflowIds = [
  'agentkit-pr-planner', 'agentkit-feature-implementation', 'agentkit-pr-review',
  'agentkit-release-readiness', 'agentkit-incident-debug', 'agentkit-architecture-evolution',
  'lesson-materials-pipeline', 'lesson-transcript-analysis', 'next-lesson-planner',
  'student-work-review', 'student-progress-report', 'competency-heatmap',
  'diagnostic-assessment', 'math-content-audit', 'learning-site-architect',
  'educational-mind-map', 'learning-lab-generator', 'infrastructure-explainer',
  'ansible-project-generator', 'learning-roadmap', 'local-llm-selector',
  'rag-tutor-architect', 'agent-evaluation'
];
const workflowPages = workflowIds.map(id => `${id}.html`);
const addedPages = [...staticAddedPages, ...workflowPages];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

for (const page of protectedOriginals) {
  const html = await read(page);
  if (!/data-detailed-original="true"/.test(html)) errors.push(`${page}: protected original marker is missing`);
}

for (const page of staticAddedPages) {
  const html = await read(page);
  if (!/assets\/app\.js/.test(html)) errors.push(`${page}: app.js is not connected`);
  if (!/name="mode"/.test(html)) errors.push(`${page}: mode selector is missing`);
  if (!/value="detailed"/.test(html) || !/value="battle"/.test(html)) errors.push(`${page}: both prompt modes are required`);
  if (/data-detailed-original="true"/.test(html)) errors.push(`${page}: added template is incorrectly protected as an original`);
}

for (const page of workflowPages) {
  const html = await read(page);
  if (!/assets\/app\.js/.test(html)) errors.push(`${page}: app.js is not connected`);
  if (!/assets\/workflow-page\.js/.test(html)) errors.push(`${page}: workflow renderer is not connected`);
  if (!/data-workflow=/.test(html)) errors.push(`${page}: data-workflow is missing`);
  if (/data-detailed-original="true"/.test(html)) errors.push(`${page}: workflow page is incorrectly protected as an original`);
}

const appSource = await read('assets/app.js');
const rendererSource = await read('assets/workflow-page.js');

for (const requiredFragment of [
  'MAX_DETAILED_PROMPT_LENGTH = 10000',
  'MAX_BATTLE_PROMPT_LENGTH = 5000',
  'injectCustomization',
  'ensureChoiceDefaults',
  'commonCustomization',
  'categoryCustomization',
  'agentkit:',
  'students:',
  'education:',
  'devops:',
  'ai:'
]) {
  if (!appSource.includes(requiredFragment)) errors.push(`assets/app.js: missing ${requiredFragment}`);
}

for (const requiredFragment of [
  'value="detailed" selected',
  'развёрнутый — до 10 000 символов',
  'field.defaultValue ?? normalized[0]?.value',
  'field.defaultValues?.length',
  "option.value === defaultValue ? ' selected' : ''"
]) {
  if (!rendererSource.includes(requiredFragment)) errors.push(`assets/workflow-page.js: missing ${requiredFragment}`);
}

try {
  new Function(appSource);
  new Function(rendererSource);
} catch (error) {
  errors.push(`shared customization JavaScript syntax error: ${error.message}`);
}

try {
  const sandbox = {
    window: {},
    location: { pathname: '/agentkit-review.html' },
    document: { addEventListener() {} },
    navigator: {},
    URL: {},
    Blob: function Blob() {},
    CSS: { escape: value => String(value) },
    setTimeout() {}
  };
  vm.runInNewContext(appSource, sandbox, { filename: 'assets/app.js' });
  const studio = sandbox.window.PromptStudio;
  if (!studio) throw new Error('PromptStudio was not exported');
  if (studio.limits?.detailed !== 10000) errors.push('detailed prompt limit is not 10,000');
  if (studio.limits?.battle !== 5000) errors.push('battle prompt limit is not 5,000');

  const detailedSource = Array.from({ length: 30 }, (_, index) => `${index}: ${'A'.repeat(700)}`).join('\n');
  const battleSource = Array.from({ length: 18 }, (_, index) => `${index}: ${'B'.repeat(500)}`).join('\n');
  const detailed = studio.fitPrompt(detailedSource, studio.limits.detailed);
  const battle = studio.fitPrompt(battleSource, studio.limits.battle);
  if (detailed.length > 10000) errors.push(`detailed prompt exceeds limit: ${detailed.length}`);
  if (battle.length > 5000) errors.push(`battle prompt exceeds limit: ${battle.length}`);
  if (!detailed.includes('автоматически сокращена')) errors.push('detailed compaction marker is missing');
  if (!battle.includes('автоматически сокращена')) errors.push('battle compaction marker is missing');
} catch (error) {
  errors.push(`customization runtime validation failed: ${error.message}`);
}

if (errors.length) {
  console.error('Customization validation failed:\n' + errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated deep customization for ${addedPages.length} added templates; protected ${protectedOriginals.length} originals.`);