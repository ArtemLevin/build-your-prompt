import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const workflowIds = [
  'agentkit-pr-planner',
  'agentkit-feature-implementation',
  'agentkit-pr-review',
  'agentkit-release-readiness',
  'agentkit-incident-debug',
  'agentkit-architecture-evolution',
  'lesson-materials-pipeline',
  'lesson-transcript-analysis',
  'next-lesson-planner',
  'student-work-review',
  'student-progress-report',
  'competency-heatmap',
  'diagnostic-assessment',
  'math-content-audit',
  'learning-site-architect',
  'educational-mind-map',
  'learning-lab-generator',
  'infrastructure-explainer',
  'ansible-project-generator',
  'learning-roadmap',
  'local-llm-selector',
  'rag-tutor-architect',
  'agent-evaluation'
];
const pages = [
  'index.html',
  'poster.html',
  'web.html',
  'latex_code_based.html',
  'excersizes_based_on_user_choice.html',
  'complex_web_handook_based_on_users_choice.html',
  'hometask.html',
  'agentkit-review.html',
  'agentkit-fix.html',
  'agentkit-architecture.html',
  ...workflowIds.map(id => `${id}.html`)
];
const javascriptAssets = [
  'assets/app.js',
  'assets/workflows.js',
  'assets/workflow-page.js',
  'assets/catalog.js'
];
const requiredAssets = [...javascriptAssets, 'assets/watercolor.css'];
const errors = [];
const localReference = /(?:href|src)="([^"]+)"/g;

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const workflowsSource = await readFile(path.join(root, 'assets/workflows.js'), 'utf8').catch(() => '');
let workflowCatalog;
try {
  const sandbox = {
    window: {},
    PromptStudio: {
      value(form, name, fallback = '') {
        return String(form?.[name] ?? fallback).trim();
      }
    }
  };
  vm.runInNewContext(workflowsSource, sandbox, { filename: 'assets/workflows.js' });
  workflowCatalog = sandbox.window.WorkflowCatalog;
} catch (error) {
  errors.push(`assets/workflows.js runtime error: ${error.message}`);
}

for (const page of pages) {
  const fullPath = path.join(root, page);
  let html;
  try {
    html = await readFile(fullPath, 'utf8');
  } catch (error) {
    errors.push(`${page}: cannot read (${error.message})`);
    continue;
  }

  if (!/^<!doctype html>/i.test(html.trimStart())) errors.push(`${page}: missing doctype`);
  if (!/<html\s+lang="ru"/i.test(html)) errors.push(`${page}: missing lang=ru`);
  if (!/name="viewport"/i.test(html)) errors.push(`${page}: missing viewport`);
  if (!/assets\/watercolor\.css/.test(html)) errors.push(`${page}: shared watercolor CSS is not connected`);
  if (!/assets\/app\.js/.test(html)) errors.push(`${page}: shared app.js is not connected`);
  if (/https?:\/\//i.test(html)) errors.push(`${page}: external network dependency found`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${page}: duplicate ids: ${[...new Set(duplicates)].join(', ')}`);

  if (page === 'index.html') {
    for (const id of ['catalogSearch', 'catalogCount', 'catalogRoot']) {
      if (!ids.includes(id)) errors.push(`${page}: missing required #${id}`);
    }
    if (!/assets\/workflows\.js/.test(html) || !/assets\/catalog\.js/.test(html)) errors.push(`${page}: catalog assets are not connected`);
  } else {
    for (const id of ['promptForm', 'outputSection', 'outputText', 'copyBtn', 'downloadBtn', 'resetBtn', 'status']) {
      if (!ids.includes(id)) errors.push(`${page}: missing required #${id}`);
    }
  }

  const workflowId = html.match(/data-workflow="([^"]+)"/)?.[1];
  if (workflowId) {
    if (page !== `${workflowId}.html`) errors.push(`${page}: data-workflow does not match filename`);
    if (!workflowIds.includes(workflowId)) errors.push(`${page}: workflow is absent from validator manifest`);
    if (!workflowCatalog?.definitions?.[workflowId]) errors.push(`${page}: workflow definition is missing`);
    if (!/assets\/workflows\.js/.test(html) || !/assets\/workflow-page\.js/.test(html)) errors.push(`${page}: workflow renderer assets are not connected`);
    for (const id of ['workflowEyebrow', 'workflowTitle', 'workflowDescription', 'workflowFields']) {
      if (!ids.includes(id)) errors.push(`${page}: missing workflow shell #${id}`);
    }
  }

  for (const match of html.matchAll(localReference)) {
    const reference = match[1];
    if (!reference || reference.startsWith('#') || reference.startsWith('data:') || reference.startsWith('mailto:')) continue;
    const clean = reference.split(/[?#]/)[0];
    const target = path.normalize(path.join(path.dirname(page), clean));
    if (!(await exists(target))) errors.push(`${page}: broken local reference ${reference}`);
  }

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  inlineScripts.forEach((match, index) => {
    try { new Function(match[1]); }
    catch (error) { errors.push(`${page}: inline script ${index + 1} syntax error: ${error.message}`); }
  });
}

for (const asset of requiredAssets) {
  if (!(await exists(asset))) errors.push(`missing asset: ${asset}`);
}

for (const asset of javascriptAssets) {
  try {
    const source = await readFile(path.join(root, asset), 'utf8');
    new Function(source);
  } catch (error) {
    errors.push(`${asset} syntax error: ${error.message}`);
  }
}

const actualIds = Object.keys(workflowCatalog?.definitions || {});
if (actualIds.length !== workflowIds.length) errors.push(`workflow count mismatch: expected ${workflowIds.length}, got ${actualIds.length}`);
for (const id of workflowIds) {
  if (!actualIds.includes(id)) errors.push(`workflow definition missing: ${id}`);
}
for (const id of actualIds) {
  if (!workflowIds.includes(id)) errors.push(`workflow is not represented by a page: ${id}`);
}

if (workflowCatalog) {
  for (const [id, definition] of Object.entries(workflowCatalog.definitions)) {
    const form = { mode: 'detailed' };
    for (const section of definition.sections || []) {
      for (const field of section.fields || []) form[field.name] = field.required ? `test-${field.name}` : '';
    }
    try {
      const detailed = workflowCatalog.build(definition, form);
      form.mode = 'battle';
      const battle = workflowCatalog.build(definition, form);
      if (detailed.length < 300) errors.push(`${id}: detailed prompt is unexpectedly short`);
      if (battle.length < 200) errors.push(`${id}: battle prompt is unexpectedly short`);
      if (definition.agentkit && (!detailed.includes('./graph.json') || !detailed.includes('graphify-out/graph.json'))) {
        errors.push(`${id}: AgentKit Graphify policy is incomplete`);
      }
    } catch (error) {
      errors.push(`${id}: prompt generation failed (${error.message})`);
    }
  }
}

try {
  const catalogSource = await readFile(path.join(root, 'assets/catalog.js'), 'utf8');
  if (!catalogSource.includes('Object.entries(WorkflowCatalog.definitions)')) errors.push('catalog does not derive workflow URLs from definition keys');
  if (catalogSource.includes('item.id')) errors.push('catalog contains the invalid item.id workflow link pattern');
} catch (error) {
  errors.push(`assets/catalog.js validation failed: ${error.message}`);
}

if (errors.length) {
  console.error('Static validation failed:\n' + errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${pages.length} HTML pages, ${workflowIds.length} workflow definitions and shared assets successfully.`);