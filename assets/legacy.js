(() => {
  'use strict';

  function outputText() {
    return document.getElementById('outputText')?.textContent || '';
  }

  window.copyPrompt = async function copyPrompt() {
    const button = document.getElementById('copyBtn');
    try {
      await PromptStudio.copyText(outputText());
      if (button) {
        const original = button.textContent;
        button.textContent = '✓ Скопировано';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove('copied');
        }, 1600);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Не удалось скопировать промпт');
    }
  };

  function downloadPrompt() {
    const text = outputText();
    if (!text.trim()) {
      window.alert('Сначала сформируйте промпт.');
      return;
    }
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

  document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copyBtn');
    if (!copyButton || document.getElementById('downloadBtn')) return;

    const downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.id = 'downloadBtn';
    downloadButton.className = 'btn-copy';
    downloadButton.textContent = '↓ Скачать .txt';
    downloadButton.addEventListener('click', downloadPrompt);
    copyButton.insertAdjacentElement('afterend', downloadButton);

    const homeLink = document.createElement('a');
    homeLink.className = 'legacy-home-link';
    homeLink.href = 'index.html';
    homeLink.textContent = '← Каталог генераторов';
    const container = document.querySelector('.container') || document.querySelector('main') || document.body;
    container.prepend(homeLink);
  });
})();