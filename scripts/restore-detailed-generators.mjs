import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const files = [
  'poster.html',
  'web.html',
  'latex_code_based.html',
  'excersizes_based_on_user_choice.html',
  'complex_web_handook_based_on_users_choice.html',
  'hometask.html'
];

const generatorNames = {
  'poster.html': 'poster',
  'web.html': 'web-equivalent',
  'latex_code_based.html': 'latex-handbook',
  'excersizes_based_on_user_choice.html': 'exercises',
  'complex_web_handook_based_on_users_choice.html': 'complex-web-handbook',
  'hometask.html': 'hometask'
};

const syntaxFixes = new Map([
  ["processing.map((p, i) => (i + 1) + ') ' + p + '.';).join('\\n')", "processing.map((p, i) => (i + 1) + ') ' + p + '.').join('\\n')"],
  ["audit.map((a, i) => String.fromCharCode(65 + i) + '. ' + a + '.';).join('\\n')", "audit.map((a, i) => String.fromCharCode(65 + i) + '. ' + a + '.').join('\\n')"],
  ["checks.map(c => '- ' + c + '.';).join('\\n')", "checks.map(c => '- ' + c + '.').join('\\n')"]
]);

for (const file of files) {
  const sourcePath = path.join('originals', file);
  const original = await readFile(sourcePath, 'utf8');
  let html = original;

  // Only presentation/runtime compatibility is changed. Prompt strings, choices and field semantics remain sourced from the archived original.
  html = html.replace(/^\s*@import\s+url\(['\"]https:\/\/fonts\.cdnfonts\.com\/css\/inter['\"]\);\s*$/m, '');
  for (const [broken, fixed] of syntaxFixes) html = html.replaceAll(broken, fixed);

  html = html.replace('</head>', '    <link rel="stylesheet" href="assets/watercolor.css">\n    <script src="assets/app.js" defer></script>\n    <script src="assets/legacy.js" defer></script>\n</head>');
  html = html.replace(/<body(\s*)>/, `<body data-generator="${generatorNames[file]}" data-detailed-original="true">`);

  if (!html.includes('data-detailed-original="true"')) throw new Error(`${file}: detailed-original marker was not applied`);
  if (!html.includes('assets/legacy.js')) throw new Error(`${file}: compatibility layer was not connected`);

  await writeFile(file, html, 'utf8');
  console.log(`${file}: restored from ${sourcePath}; ${original.length} -> ${html.length} chars`);
}
