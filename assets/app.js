(() => {
  'use strict';

  const navItems = [
    ['index.html', 'Каталог'],
    ['index.html#education', 'Образование'],
    ['index.html#students', 'Ученики'],
    ['index.html#agentkit', 'AgentKit'],
    ['index.html#devops', 'DevOps'],
    ['index.html#ai', 'AI']
  ];
  const fileName = location.pathname.split('/').pop() || 'index.html';

  function injectNavigation() {
    if (document.querySelector('.site-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Основная навигация');
    const links = navItems.map(([href, label], index) => {
      const current = fileName === 'index.html' && index === 0 ? ' aria-current="page"' : '';
      return `<a href="${href}"${current}>${label}</a>`;
    }).join('');
    nav.innerHTML = `<div class="nav-inner">
      <a class="brand" href="index.html"><span class="brand-mark">✦</span><span>Build your prompt</span></a>
      <div class="nav-links">${links}</div>
    </div>`;
    document.body.prepend(nav);
  }

  function injectFooter() {
    if (document.querySelector('.footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.textContent = 'Локальная библиотека генераторов промптов · без внешних runtime-зависимостей';
    document.body.append(footer);
  }

  function checked(form, name) {
    const safeName = String(name).replace(/["\\]/g, '\\$&');
    return [...form.querySelectorAll(`[name="${safeName}"]:checked`)].map(element => element.value);
  }

  function value(form, name, fallback = '') {
    const field = form.elements.namedItem(name);
    if (!field) return fallback;
    if (typeof RadioNodeList !== 'undefined' && field instanceof RadioNodeList) return field.value || fallback;
    return String(field.value || fallback).trim();
  }

  function list(valueToFormat, empty = 'не задано') {
    const values = Array.isArray(valueToFormat) ? valueToFormat : [valueToFormat];
    const cleaned = values.map(item => String(item || '').trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(', ') : empty;
  }

  function block(title, content, empty = 'не задано') {
    const normalized = Array.isArray(content) ? content.filter(Boolean) : String(content || '').trim();
    if (Array.isArray(normalized)) return `${title}:\n${normalized.length ? normalized.map(item => `- ${item}`).join('\n') : `- ${empty}`}`;
    return `${title}: ${normalized || empty}`;
  }

  function setStatus(message, isError = false) {
    const status = document.getElementById('status');
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? '#9b4f5a' : '';
  }

  function setOutput(text) {
    const output = document.getElementById('outputText');
    const section = document.getElementById('outputSection');
    if (!output || !section) throw new Error('Output container is missing');
    output.textContent = text.trim();
    section.classList.add('visible');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStatus('Промпт сформирован. Проверьте значения перед копированием.');
  }

  async function copyText(text) {
    if (!text.trim()) throw new Error('Сначала сформируйте промпт');
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    if (!copied) throw new Error('Браузер заблокировал копирование');
  }

  async function handleCopy(button) {
    try {
      const text = document.getElementById('outputText')?.textContent || '';
      await copyText(text);
      const original = button.textContent;
      button.textContent = '✓ Скопировано';
      setStatus('Промпт скопирован в буфер обмена.');
      setTimeout(() => { button.textContent = original; }, 1600);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось скопировать текст', true);
    }
  }

  function downloadPrompt() {
    const text = document.getElementById('outputText')?.textContent || '';
    if (!text.trim()) return setStatus('Сначала сформируйте промпт.', true);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.body.dataset.generator || 'prompt'}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function storageKey() { return `build-your-prompt:${fileName}`; }
  function storageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function storageSet(key, storedValue) { try { localStorage.setItem(key, storedValue); } catch { /* optional */ } }
  function storageRemove(key) { try { localStorage.removeItem(key); } catch { /* optional */ } }

  function saveDraft(form) {
    const data = {};
    for (const element of form.elements) {
      if (!element.name || ['submit', 'button'].includes(element.type)) continue;
      if (element.type === 'checkbox') {
        data[element.name] ||= [];
        if (element.checked) data[element.name].push(element.value);
      } else if (element.type === 'radio') {
        if (element.checked) data[element.name] = element.value;
      } else data[element.name] = element.value;
    }
    storageSet(storageKey(), JSON.stringify(data));
  }

  function restoreDraft(form) {
    let data;
    try { data = JSON.parse(storageGet(storageKey()) || 'null'); } catch { return; }
    if (!data) return;
    for (const element of form.elements) {
      if (!element.name || !(element.name in data)) continue;
      if (element.type === 'checkbox') element.checked = Array.isArray(data[element.name]) && data[element.name].includes(element.value);
      else if (element.type === 'radio') element.checked = data[element.name] === element.value;
      else element.value = data[element.name];
    }
  }

  function bind({ build }) {
    const form = document.getElementById('promptForm');
    if (!form) return;
    restoreDraft(form);
    form.addEventListener('input', () => saveDraft(form));
    form.addEventListener('change', () => saveDraft(form));
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      try { setOutput(build(form)); }
      catch (error) { setStatus(`Ошибка генерации: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`, true); }
    });
    document.getElementById('copyBtn')?.addEventListener('click', event => handleCopy(event.currentTarget));
    document.getElementById('downloadBtn')?.addEventListener('click', downloadPrompt);
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      form.reset();
      storageRemove(storageKey());
      document.getElementById('outputSection')?.classList.remove('visible');
      setStatus('Форма очищена.');
    });
  }

  window.PromptStudio = { bind, checked, value, list, block, setOutput, copyText };
  document.addEventListener('DOMContentLoaded', () => { injectNavigation(); injectFooter(); });
})();