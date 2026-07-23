(() => {
  'use strict';

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function renderField(field) {
    const required = field.required ? ' required' : '';
    const badge = field.required ? '<span class="badge required">обязательно</span>' : '';
    const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
    const label = `<label for="${escapeHtml(field.name)}">${escapeHtml(field.label)} ${badge}</label>`;

    if (field.type === 'select') {
      const options = (field.options || []).map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
      return `<div class="form-group">${label}<select id="${escapeHtml(field.name)}" name="${escapeHtml(field.name)}"${required}>${options}</select></div>`;
    }
    if (field.type === 'text') {
      return `<div class="form-group">${label}<input type="text" id="${escapeHtml(field.name)}" name="${escapeHtml(field.name)}"${placeholder}${required}></div>`;
    }
    return `<div class="form-group">${label}<textarea id="${escapeHtml(field.name)}" name="${escapeHtml(field.name)}"${placeholder}${required}></textarea></div>`;
  }

  function renderPage() {
    const id = document.body.dataset.workflow;
    const catalog = window.WorkflowCatalog;
    const definition = catalog?.definitions?.[id];
    if (!definition) {
      document.getElementById('status').textContent = `Не найдена конфигурация генератора: ${id || 'не задано'}`;
      return;
    }

    document.body.dataset.generator = id;
    document.title = `${definition.title} — Build your prompt`;
    document.getElementById('workflowEyebrow').textContent = definition.eyebrow;
    document.getElementById('workflowTitle').textContent = definition.title;
    document.getElementById('workflowDescription').textContent = definition.description;

    const sections = [
      `<section class="form-section"><h2><span class="section-number">0</span>Режим</h2><div class="form-grid"><div class="form-group"><label for="mode">Формат промпта</label><select id="mode" name="mode"><option value="detailed">развёрнутый</option><option value="battle">краткий боевой</option></select></div></div></section>`,
      ...definition.sections.map((section, index) => `<section class="form-section"><h2><span class="section-number">${index + 1}</span>${escapeHtml(section.title)}</h2><div class="form-grid">${section.fields.map(renderField).join('')}</div></section>`)
    ];
    document.getElementById('workflowFields').innerHTML = sections.join('');

    PromptStudio.bind({ build: form => catalog.build(definition, form) });
  }

  document.addEventListener('DOMContentLoaded', renderPage);
})();