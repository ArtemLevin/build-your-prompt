(() => {
  'use strict';

  const MAX_DETAILED_PROMPT_LENGTH = 10000;
  const MAX_BATTLE_PROMPT_LENGTH = 5000;
  const navItems = [
    ['index.html', 'Каталог'],
    ['index.html#education', 'Образование'],
    ['index.html#students', 'Ученики'],
    ['index.html#agentkit', 'AgentKit'],
    ['index.html#devops', 'DevOps'],
    ['index.html#ai', 'AI']
  ];
  const fileName = location.pathname.split('/').pop() || 'index.html';

  const commonCustomization = [
    ['customProfile', 'Профиль промпта', [
      'Сбалансированный профессиональный',
      'Evidence-first: выводы только с доказательствами',
      'Максимально глубокий исследовательский',
      'Практический с минимальной достаточной сложностью',
      'Adversarial: активный поиск слабых мест',
      'Образовательный с объяснением решений',
      'Production-grade с эксплуатационными критериями'
    ], 'Сбалансированный профессиональный'],
    ['customDepth', 'Глубина проработки', [
      'Глубокая', 'Стандартная', 'Исчерпывающая', 'Точечная по критическим рискам', 'От общего к частному'
    ], 'Глубокая'],
    ['customStructure', 'Структура результата', [
      'Иерархический отчёт с разделами',
      'Пошаговый план с контрольными точками',
      'Таблицы, чек-листы и итоговый verdict',
      'ADR, риски и roadmap',
      'Краткая записка для принятия решения',
      'Учебное объяснение с примерами'
    ], 'Иерархический отчёт с разделами'],
    ['customTone', 'Тон', [
      'Строгий профессиональный', 'Доступный без потери точности', 'Академический', 'Наставнический', 'Исполнительный для руководителя', 'Технический лаконичный'
    ], 'Строгий профессиональный'],
    ['customEvidence', 'Политика доказательств', [
      'Проверять каждый существенный вывод',
      'Использовать только первичные источники и фактические проверки',
      'Код, тесты и выполненные команды важнее предположений',
      'Допущения допустимы только с явной маркировкой',
      'Разрешён исследовательский режим с гипотезами'
    ], 'Проверять каждый существенный вывод'],
    ['customAutonomy', 'Автономность исполнителя', [
      'Продолжать с разумными допущениями',
      'Задавать вопрос только при блокирующей неопределённости',
      'Не делать допущений без подтверждения',
      'Самостоятельно выбирать лучший вариант и объяснять выбор',
      'Сначала предлагать альтернативы, затем выбирать'
    ], 'Продолжать с разумными допущениями'],
    ['customRisk', 'Допуск риска', [
      'Консервативный', 'Сбалансированный', 'Экспериментальный с rollback', 'Критичный к данным и безопасности', 'Оптимизированный под скорость выпуска'
    ], 'Консервативный'],
    ['customAudience', 'Целевая аудитория ответа', [
      'Опытный специалист', 'Начинающий', 'Смешанная аудитория', 'Руководитель проекта', 'Разработчик-исполнитель', 'Преподаватель и ученик'
    ], 'Опытный специалист'],
    ['customLanguage', 'Язык и терминология', [
      'Русский с общепринятыми английскими терминами', 'Полностью русский', 'Английский', 'Русский с расшифровкой терминов', 'Двуязычные ключевые понятия'
    ], 'Русский с общепринятыми английскими терминами']
  ];

  const categoryCustomization = {
    agentkit: [
      ['domainPreset', 'AgentKit-профиль', [
        'Строгий evidence-driven workflow', 'Fast локальное изменение', 'Deep audit', 'Production/release gate', 'Migration-safe изменение', 'Incident/root-cause workflow'
      ], 'Строгий evidence-driven workflow'],
      ['domainVerification', 'Глубина проверок', [
        'Точечные тесты + callers + полный suite по риску', 'Только релевантные проверки', 'Полный suite, lint, types и build', 'Read-only анализ без выполнения команд', 'Проверки с adversarial second pass'
      ], 'Точечные тесты + callers + полный suite по риску'],
      ['domainScope', 'Политика scope', [
        'Минимальный diff', 'Ограниченный рефакторинг затронутой подсистемы', 'Архитектурная эволюция по этапам', 'Только анализ без изменений', 'Вертикальный срез функции'
      ], 'Минимальный diff'],
      ['domainGit', 'Git-полномочия', [
        'Без commit, push и PR', 'Commit разрешён, push запрещён', 'Commit и push разрешены', 'Draft PR разрешён, merge запрещён', 'Только review существующего PR'
      ], 'Без commit, push и PR'],
      ['domainGraph', 'Работа с Graphify', [
        'Корневой graph.json как индекс + проверка по коду', 'Source-first, graph.json только для межмодульных связей', 'Обязательная проверка callers/callees через graph.json', 'Graph.json только для hotspots и циклов'
      ], 'Корневой graph.json как индекс + проверка по коду']
    ],
    students: [
      ['domainPreset', 'Педагогический профиль', [
        'Адаптивное обучение со scaffolding', 'Экзаменационная подготовка', 'Диагностика пробелов', 'Mastery learning', 'Развитие самостоятельности', 'Работа с сильным учеником'
      ], 'Адаптивное обучение со scaffolding'],
      ['domainLevel', 'Профиль ученика', [
        'Средний уровень', 'Есть системные пробелы', 'Сильный ученик', 'Высокая тревожность', 'Низкая самостоятельность', 'Кандидат на высокий балл'
      ], 'Средний уровень'],
      ['domainFeedback', 'Стиль обратной связи', [
        'Поддерживающий и конкретный', 'Строгий экзаменационный', 'Краткий деловой', 'Метакогнитивный с вопросами', 'Понятный родителю', 'Мотивационный без завышения оценки'
      ], 'Поддерживающий и конкретный'],
      ['domainAssessment', 'Модель оценивания', [
        'По навыкам и первопричинам ошибок', 'По экзаменационным критериям', 'Формирующее оценивание', 'Диагностическая матрица', 'Без баллов, только рекомендации'
      ], 'По навыкам и первопричинам ошибок'],
      ['domainPersonalization', 'Глубина персонализации', [
        'По текущим ошибкам и динамике', 'По цели экзамена', 'По темпу и стилю обучения', 'Минимальная персонализация', 'Максимальная с планом следующих занятий'
      ], 'По текущим ошибкам и динамике']
    ],
    education: [
      ['domainPreset', 'Методический профиль', [
        'Объяснение → пример → практика → самопроверка', 'Problem-based learning', 'Экзаменационный тренажёр', 'Справочник-конспект', 'Диагностический материал', 'Интерактивный мини-курс'
      ], 'Объяснение → пример → практика → самопроверка'],
      ['domainDifficulty', 'Сложность', [
        'Плавная прогрессия', 'Базовый уровень', 'Повышенный уровень', 'Олимпиадный уровень', 'Смешанная с маркировкой', 'Адаптивная по ответам'
      ], 'Плавная прогрессия'],
      ['domainSolutions', 'Показ решений', [
        'Ответы и подробные решения отдельно', 'Только ответы', 'Подсказки по уровням', 'Решения после самостоятельной попытки', 'Без решений', 'Разбор типичных ошибок'
      ], 'Ответы и подробные решения отдельно'],
      ['domainVisuals', 'Визуализация', [
        'Использовать только когда помогает пониманию', 'Максимально наглядно', 'Минималистично', 'Чертежи и схемы обязательны', 'Интерактивные визуализации', 'Без декоративных элементов'
      ], 'Использовать только когда помогает пониманию'],
      ['domainAccessibility', 'Доступность', [
        'Стандартная доступность', 'Простой язык и короткие блоки', 'Поддержка screen reader', 'Высокий контраст и keyboard navigation', 'Печатная версия обязательна'
      ], 'Стандартная доступность']
    ],
    devops: [
      ['domainPreset', 'Инфраструктурный профиль', [
        'Учебный безопасный стенд', 'Production-like лаборатория', 'Минимальная стоимость', 'Максимальная воспроизводимость', 'Troubleshooting-first', 'Security-first'
      ], 'Учебный безопасный стенд'],
      ['domainEnvironment', 'Окружение', [
        'Локальная Ubuntu/WSL + тестовая ВМ', 'Yandex Cloud', 'Docker Compose', 'Linux VPS', 'Kubernetes', 'CI sandbox'
      ], 'Локальная Ubuntu/WSL + тестовая ВМ'],
      ['domainExplanation', 'Глубина объяснения', [
        'Для начинающего: от общего к частному', 'Для middle-инженера', 'Только команды и проверки', 'С альтернативами и ошибками', 'С внутренней механикой каждого шага'
      ], 'Для начинающего: от общего к частному'],
      ['domainSafety', 'Безопасность выполнения', [
        'Dry-run и явные проверки перед изменениями', 'Изолированный disposable-стенд', 'Production-safe без destructive шагов', 'Разрешены controlled destructive эксперименты', 'Только read-only диагностика'
      ], 'Dry-run и явные проверки перед изменениями'],
      ['domainCleanup', 'Завершение стенда', [
        'Полный cleanup и проверка отсутствия расходов', 'Сохранить ресурсы для продолжения', 'Автоматический teardown', 'Снимок состояния перед удалением'
      ], 'Полный cleanup и проверка отсутствия расходов']
    ],
    ai: [
      ['domainPreset', 'AI-профиль', [
        'Качество и доказательная оценка', 'Локальный privacy-first', 'Минимальная стоимость', 'Низкая latency', 'Production reliability', 'Экспериментальное сравнение моделей'
      ], 'Качество и доказательная оценка'],
      ['domainDeployment', 'Развёртывание AI', [
        'Локально через Ollama/llama.cpp', 'Облачный API', 'Гибридный режим', 'On-premise', 'Не выбирать заранее — сравнить варианты'
      ], 'Не выбирать заранее — сравнить варианты'],
      ['domainPriority', 'Главный приоритет', [
        'Точность', 'Скорость', 'Стоимость', 'Приватность', 'Длина контекста', 'Качество tool use', 'Математика и код'
      ], 'Точность'],
      ['domainEvaluation', 'Оценивание', [
        'Golden + adversarial + regression gate', 'Ручная экспертная оценка', 'Автоматические метрики + spot-check', 'A/B сравнение', 'Минимальный smoke benchmark'
      ], 'Golden + adversarial + regression gate'],
      ['domainFreshness', 'Актуальность данных', [
        'Проверять текущие версии по первичным источникам', 'Использовать только переданные данные', 'Проверять только изменчивые факты', 'Зафиксировать дату и версии всех компонентов'
      ], 'Проверять текущие версии по первичным источникам']
    ],
    general: [
      ['domainPreset', 'Предметный профиль', [
        'Универсальный сбалансированный', 'Исследовательский', 'Практический', 'Образовательный', 'Аудиторский', 'Проектный'
      ], 'Универсальный сбалансированный'],
      ['domainVerification', 'Проверка результата', [
        'Самопроверка по критериям', 'Независимый второй проход', 'Только базовая проверка', 'Проверка примерами и контрпримерами'
      ], 'Самопроверка по критериям']
    ]
  };

  const qualityOptions = [
    ['явно отделять факты, допущения и гипотезы', true],
    ['рассматривать альтернативы и объяснять выбор', true],
    ['проверять граничные и ошибочные сценарии', true],
    ['проводить финальную самопроверку', true],
    ['указывать риски и ограничения результата', true],
    ['приводить конкретные примеры', false],
    ['добавлять критерии готовности', true],
    ['фиксировать выполненные проверки', true]
  ];
  const outputOptions = [
    ['краткое executive summary', true],
    ['таблица ключевых решений', false],
    ['пошаговый план действий', true],
    ['чек-лист контроля качества', true],
    ['реестр рисков', true],
    ['список открытых вопросов', false],
    ['roadmap следующих этапов', false],
    ['готовые команды или шаблоны', false]
  ];

  const escapeHtml = raw => String(raw ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  function injectNavigation() {
    if (document.querySelector('.site-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Основная навигация');
    const links = navItems.map(([href, label], index) => {
      const current = fileName === 'index.html' && index === 0 ? ' aria-current="page"' : '';
      return `<a href="${href}"${current}>${label}</a>`;
    }).join('');
    nav.innerHTML = `<div class="nav-inner"><a class="brand" href="index.html"><span class="brand-mark">✦</span><span>Build your prompt</span></a><div class="nav-links">${links}</div></div>`;
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
    const mode = document.getElementById('mode')?.value || 'detailed';
    const limit = mode === 'battle' ? MAX_BATTLE_PROMPT_LENGTH : MAX_DETAILED_PROMPT_LENGTH;
    setStatus(`Промпт сформирован: ${text.trim().length} из ${limit} символов.`);
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

  function currentCategory() {
    const id = document.body.dataset.workflow || document.body.dataset.generator || '';
    return window.WorkflowCatalog?.definitions?.[id]?.category || (id.startsWith('agentkit-') ? 'agentkit' : 'general');
  }

  function renderSelect([name, label, options, selected]) {
    const rendered = options.map(option => `<option value="${escapeHtml(option)}"${option === selected ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('');
    return `<div class="form-group"><label for="${name}">${escapeHtml(label)} <span class="badge">по умолчанию задано</span></label><select id="${name}" name="${name}">${rendered}</select></div>`;
  }

  function renderChecks(name, options) {
    return `<div class="option-grid">${options.map(([option, selected], index) => `<label><input type="checkbox" name="${name}" value="${escapeHtml(option)}"${selected ? ' checked' : ''}>${escapeHtml(option)}</label>`).join('')}</div>`;
  }

  function injectCustomization() {
    const form = document.getElementById('promptForm');
    if (!form || fileName === 'index.html' || document.body.dataset.detailedOriginal === 'true' || document.getElementById('deepCustomization')) return;
    const category = currentCategory();
    const common = document.createElement('section');
    common.className = 'form-section';
    common.id = 'deepCustomization';
    common.innerHTML = `<h2><span class="section-number">⚙</span>Глубокая кастомизация</h2><p class="hint">Предустановки уже выбраны. Изменяйте только нужные параметры.</p><div class="form-grid">${commonCustomization.map(renderSelect).join('')}</div><div class="form-group"><label>Обязательные quality gates</label>${renderChecks('customQuality', qualityOptions)}</div><div class="form-group"><label>Дополнительные элементы результата</label>${renderChecks('customOutput', outputOptions)}</div>`;

    const domain = document.createElement('section');
    domain.className = 'form-section';
    domain.id = 'domainCustomization';
    domain.innerHTML = `<h2><span class="section-number">◆</span>Предметные предустановки</h2><div class="form-grid">${(categoryCustomization[category] || categoryCustomization.general).map(renderSelect).join('')}</div>`;

    const actions = [...form.children].find(child => child.classList?.contains('actions')) || null;
    form.insertBefore(common, actions);
    form.insertBefore(domain, actions);
  }

  function ensureChoiceDefaults(form) {
    for (const select of form.querySelectorAll('select')) {
      if (select.selectedIndex < 0 && select.options.length) select.selectedIndex = 0;
    }
    const radioNames = [...new Set([...form.querySelectorAll('input[type="radio"][name]')].map(input => input.name))];
    for (const name of radioNames) {
      const group = [...form.querySelectorAll(`input[type="radio"][name="${CSS.escape(name)}"]`)];
      if (!group.some(input => input.checked) && group[0]) group[0].checked = true;
    }
    const checkboxNames = [...new Set([...form.querySelectorAll('input[type="checkbox"][name]')].map(input => input.name))];
    for (const name of checkboxNames) {
      const group = [...form.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]`)];
      if (!group.some(input => input.checked) && group[0]) group[0].checked = true;
    }
  }

  function customizationBlock(form, mode) {
    const commonRows = commonCustomization.map(([name, label]) => `${label}: ${value(form, name)}`);
    const categoryRows = (categoryCustomization[currentCategory()] || categoryCustomization.general).map(([name, label]) => `${label}: ${value(form, name)}`);
    const quality = checked(form, 'customQuality');
    const outputs = checked(form, 'customOutput');
    if (mode === 'battle') {
      return `\n\nБОЕВАЯ КОНФИГУРАЦИЯ\n${[...commonRows, ...categoryRows].join('; ')}.\nГейты: ${quality.join('; ')}.\nРезультат: ${outputs.join('; ')}.`;
    }
    return `\n\nГЛУБОКАЯ КАСТОМИЗАЦИЯ\n${[...commonRows, ...categoryRows].join('\n')}\n\nОБЯЗАТЕЛЬНЫЕ QUALITY GATES\n${quality.map(item => `- ${item};`).join('\n')}\n\nДОПОЛНИТЕЛЬНЫЕ ЭЛЕМЕНТЫ РЕЗУЛЬТАТА\n${outputs.map(item => `- ${item};`).join('\n')}\n\nПрименяй настройки как единый контракт. При конфликте приоритет имеют безопасность, фактические требования пользователя, доказательства и явно заданные ограничения задачи.`;
  }

  function compactLongLines(text, lineLimit = 900) {
    return text.split('\n').map(line => line.length > lineLimit ? `${line.slice(0, lineLimit - 1)}…` : line).join('\n');
  }

  function fitPrompt(text, limit) {
    let normalized = String(text || '').replace(/\n{4,}/g, '\n\n\n').trim();
    if (normalized.length <= limit) return normalized;
    normalized = compactLongLines(normalized);
    if (normalized.length <= limit) return normalized;
    const marker = '\n\n[Средняя часть автоматически сокращена для соблюдения лимита. Сузьте входные данные, если важна каждая деталь.]\n\n';
    const available = limit - marker.length;
    const headSize = Math.floor(available * 0.64);
    const tailSize = available - headSize;
    return `${normalized.slice(0, headSize).trimEnd()}${marker}${normalized.slice(-tailSize).trimStart()}`.slice(0, limit);
  }

  function enhancePrompt(raw, form) {
    if (document.body.dataset.detailedOriginal === 'true' || fileName === 'index.html') return String(raw || '').trim();
    const mode = value(form, 'mode', 'detailed') === 'battle' ? 'battle' : 'detailed';
    const limit = mode === 'battle' ? MAX_BATTLE_PROMPT_LENGTH : MAX_DETAILED_PROMPT_LENGTH;
    return fitPrompt(`${String(raw || '').trim()}${customizationBlock(form, mode)}`, limit);
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
    ensureChoiceDefaults(form);
    restoreDraft(form);
    form.addEventListener('input', () => saveDraft(form));
    form.addEventListener('change', () => saveDraft(form));
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      try { setOutput(enhancePrompt(build(form), form)); }
      catch (error) { setStatus(`Ошибка генерации: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`, true); }
    });
    document.getElementById('copyBtn')?.addEventListener('click', event => handleCopy(event.currentTarget));
    document.getElementById('downloadBtn')?.addEventListener('click', downloadPrompt);
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      form.reset();
      ensureChoiceDefaults(form);
      storageRemove(storageKey());
      document.getElementById('outputSection')?.classList.remove('visible');
      setStatus('Форма очищена; восстановлены значения по умолчанию.');
    });
  }

  window.PromptStudio = {
    bind, checked, value, list, block, setOutput, copyText,
    enhancePrompt, fitPrompt,
    limits: { detailed: MAX_DETAILED_PROMPT_LENGTH, battle: MAX_BATTLE_PROMPT_LENGTH }
  };

  document.addEventListener('DOMContentLoaded', () => {
    injectNavigation();
    injectFooter();
    injectCustomization();
  });
})();