(() => {
  'use strict';

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function normalizeOption(option) {
    return typeof option === 'string' ? { value: option, label: option } : option;
  }

  function renderField(field) {
    const required = field.required ? ' required' : '';
    const badge = field.required ? '<span class="badge required">обязательно</span>' : '';
    const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
    const maxLength = Number.isInteger(field.maxLength) ? field.maxLength : (field.type === 'text' ? 600 : 1600);
    const label = `<label for="${escapeHtml(field.name)}">${escapeHtml(field.label)} ${badge}</label>`;

    if (field.type === 'select') {
      const normalized = (field.options || []).map(normalizeOption);
      const defaultValue = field.defaultValue ?? normalized[0]?.value ?? '';
      const options = normalized.map(option => `<option value="${escapeHtml(option.value)}"${option.value === defaultValue ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('');
      return `<div class="form-group">${label}<select id="${escapeHtml(field.name)}" name="${escapeHtml(field.name)}"${required}>${options}</select></div>`;
    }

    if (field.type === 'radio') {
      const normalized = (field.options || []).map(normalizeOption);
      const defaultValue = field.defaultValue ?? normalized[0]?.value ?? '';
      const items = normalized.map((option, index) => `<label><input type="radio" name="${escapeHtml(field.name)}" value="${escapeHtml(option.value)}"${option.value === defaultValue ? ' checked' : ''}${required && index === 0 ? ' required' : ''}>${escapeHtml(option.label)}</label>`).join('');
      return `<div class="form-group"><span class="field-label">${escapeHtml(field.label)} ${badge}</span><div class="option-grid">${items}</div></div>`;
    }

    if (field.type === 'checkbox') {
      const normalized = (field.options || []).map(normalizeOption);
      const defaults = new Set(field.defaultValues?.length ? field.defaultValues : normalized.slice(0, 1).map(option => option.value));
      const items = normalized.map(option => `<label><input type="checkbox" name="${escapeHtml(field.name)}" value="${escapeHtml(option.value)}"${defaults.has(option.value) ? ' checked' : ''}>${escapeHtml(option.label)}</label>`).join('');
      return `<div class="form-group"><span class="field-label">${escapeHtml(field.label)} ${badge}</span><div class="option-grid">${items}</div></div>`;
    }

    if (field.type === 'text') {
      const defaultValue = field.defaultValue ? ` value="${escapeHtml(field.defaultValue)}"` : '';
      return `<div class="form-group">${label}<input type="text" id="${escapeHtml(field.name)}" name="${escapeHtml(field.name)}" maxlength="${maxLength}"${defaultValue}${placeholder}${required}></div>`;
    }

    const defaultValue = field.defaultValue ? escapeHtml(field.defaultValue) : '';
    return `<div class="form-group">${label}<textarea id="${escapeHtml(field.name)}" name="${escapeHtml(field.name)}" maxlength="${maxLength}"${placeholder}${required}>${defaultValue}</textarea></div>`;
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
      `<section class="form-section"><h2><span class="section-number">0</span>Режим</h2><div class="form-grid"><div class="form-group"><label for="mode">Формат промпта <span class="badge">по умолчанию задано</span></label><select id="mode" name="mode"><option value="detailed" selected>развёрнутый — до 10 000 символов</option><option value="battle">краткий боевой</option></select></div></div></section>`,
      ...definition.sections.map((section, index) => `<section class="form-section"><h2><span class="section-number">${index + 1}</span>${escapeHtml(section.title)}</h2><div class="form-grid">${section.fields.map(renderField).join('')}</div></section>`)
    ];
    document.getElementById('workflowFields').innerHTML = sections.join('');

    PromptStudio.bind({ build: form => catalog.build(definition, form) });
  }

  document.addEventListener('DOMContentLoaded', renderPage);
})();