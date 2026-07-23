(() => {
  'use strict';

  const legacy = [
    { category: 'education', href: 'poster.html', icon: '🎨', title: 'Инфографика', description: 'Учебная карточка или постер с настройкой темы, аудитории, содержания и визуального языка.', tag: 'Изображение' },
    { category: 'education', href: 'web.html', icon: '🌐', title: 'Web-эквивалент', description: 'Техническое задание на автономную интерактивную HTML-страницу по учебному материалу.', tag: 'HTML' },
    { category: 'education', href: 'latex_code_based.html', icon: '∑', title: 'LaTeX-пособие', description: 'Математически корректный и готовый к компиляции LaTeX-документ.', tag: 'PDF / TeX' },
    { category: 'education', href: 'excersizes_based_on_user_choice.html', icon: '✎', title: 'Набор упражнений', description: 'Вариативные задачи по темам, уровню, классу и формату ответов.', tag: 'Практика' },
    { category: 'education', href: 'complex_web_handook_based_on_users_choice.html', icon: '📚', title: 'Комплексное web-пособие', description: 'Многостраничный учебный сайт с MathML, навигацией и самопроверкой.', tag: 'Web course' },
    { category: 'education', href: 'hometask.html', icon: '✓', title: 'Домашняя или контрольная работа', description: 'Сбалансированный вариант с управлением сложностью, решениями и критериями.', tag: 'Оценивание' },
    { category: 'agentkit', href: 'agentkit-review.html', icon: '🔎', title: 'Полное ревью репозитория', description: 'Read-only аудит архитектуры, надёжности, безопасности, тестов и production-готовности.', tag: 'Audit' },
    { category: 'agentkit', href: 'agentkit-fix.html', icon: '🛠', title: 'Устранение findings', description: 'Доказательное исправление P0–P2 с regression tests и adversarial review.', tag: 'Implementation' },
    { category: 'agentkit', href: 'agentkit-architecture.html', icon: '⌘', title: 'Архитектура сервиса', description: 'Requirements contract, варианты архитектуры, ADR, данные и roadmap.', tag: 'Architecture' }
  ];

  const labelOrder = ['education', 'students', 'agentkit', 'devops', 'ai'];
  const labels = {
    education: 'Образовательный контент',
    students: 'Работа с учениками',
    agentkit: 'Разработка с AgentKit',
    devops: 'Python, DevOps и обучение',
    ai: 'AI и локальные LLM'
  };

  function allTools() {
    const generated = Object.values(WorkflowCatalog.definitions).map(item => ({
      category: item.category,
      href: `${item.id}.html`,
      icon: item.icon,
      title: item.title,
      description: item.description,
      tag: item.tag
    }));
    return [...legacy, ...generated];
  }

  function card(tool) {
    return `<a class="tool-card" href="${tool.href}" data-search="${[tool.title, tool.description, tool.tag].join(' ').toLowerCase()}">
      <span class="tool-icon">${tool.icon}</span><h2>${tool.title}</h2>
      <p>${tool.description}</p><span class="tag">${tool.tag}</span>
    </a>`;
  }

  function render(filter = '') {
    const query = filter.trim().toLowerCase();
    const tools = allTools().filter(tool => !query || [tool.title, tool.description, tool.tag, labels[tool.category]].join(' ').toLowerCase().includes(query));
    const root = document.getElementById('catalogRoot');
    root.innerHTML = labelOrder.map(category => {
      const items = tools.filter(tool => tool.category === category);
      if (!items.length) return '';
      return `<section class="panel" id="${category}" aria-labelledby="${category}-title">
        <h2 id="${category}-title">${labels[category]}</h2>
        <div class="card-grid">${items.map(card).join('')}</div>
      </section>`;
    }).join('') || '<section class="panel"><h2>Ничего не найдено</h2><p>Измените поисковый запрос.</p></section>';
    document.getElementById('catalogCount').textContent = `${tools.length} генераторов`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.getElementById('catalogSearch')?.addEventListener('input', event => render(event.currentTarget.value));
  });
})();