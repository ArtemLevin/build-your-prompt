# Build your prompt

Локальная библиотека интерактивных генераторов промптов в едином акварельном дизайне.

## Запуск

Откройте `index.html` в браузере. Сборка, сервер и интернет-соединение не требуются.

Главная страница содержит поиск и пять тематических разделов. Каждый генератор поддерживает сохранение черновика, копирование, скачивание `.txt`, очистку формы и два режима — развёрнутый и краткий боевой, когда это предусмотрено сценарием.

## Библиотека

### Образовательный контент

- `poster.html` — учебная инфографика;
- `web.html` — интерактивный web-эквивалент;
- `latex_code_based.html` — LaTeX-пособие;
- `excersizes_based_on_user_choice.html` — набор упражнений;
- `complex_web_handook_based_on_users_choice.html` — комплексное web-пособие;
- `hometask.html` — домашняя или контрольная работа;
- `diagnostic-assessment.html` — диагностическая работа по компетенциям;
- `math-content-audit.html` — независимый аудит математического контента;
- `learning-site-architect.html` — архитектура образовательного сайта или курса;
- `educational-mind-map.html` — ментальная карта учебной темы.

### Работа с учениками

- `lesson-materials-pipeline.html` — транскрипт и изображения → LaTeX, PDF, постер, web и сайт ученика;
- `lesson-transcript-analysis.html` — педагогический анализ транскрипта;
- `next-lesson-planner.html` — индивидуальный план следующего занятия;
- `student-work-review.html` — проверка выполненной работы;
- `student-progress-report.html` — отчёт ученику или родителю;
- `competency-heatmap.html` — проектирование и безопасное обновление карты компетенций.

### Разработка с AgentKit

- `agentkit-review.html` — полное read-only ревью репозитория;
- `agentkit-fix.html` — устранение подтверждённых findings;
- `agentkit-architecture.html` — проектирование нового сервиса;
- `agentkit-pr-planner.html` — планирование отдельного PR;
- `agentkit-feature-implementation.html` — реализация функции по требованиям;
- `agentkit-pr-review.html` — проверка merge-readiness PR;
- `agentkit-release-readiness.html` — production/release gate;
- `agentkit-incident-debug.html` — расследование неисправности;
- `agentkit-architecture-evolution.html` — эволюция существующей архитектуры.

AgentKit-шаблоны используют Graphify только через корневой `./graph.json`. Они запрещают запуск `graphify`, `agentkit graph update`, `agentkit graph query` и чтение `graphify-out/graph.json`.

### Python, DevOps и обучение

- `learning-lab-generator.html` — учебный лабораторный стенд;
- `infrastructure-explainer.html` — объяснение инфраструктурного проекта от общего к частному;
- `ansible-project-generator.html` — inventory, roles, Vault, filters и проверки идемпотентности;
- `learning-roadmap.html` — roadmap изучения технологии или профессии.

### AI и локальные LLM

- `local-llm-selector.html` — выбор актуальной локальной модели и квантования;
- `rag-tutor-architect.html` — архитектура RAG-ассистента по материалам;
- `agent-evaluation.html` — golden/adversarial evals и regression gate для AI-агента.

## Архитектура интерфейса

- `assets/watercolor.css` — единая акварельная дизайн-система;
- `assets/app.js` — навигация, черновики, копирование, скачивание и общий form lifecycle;
- `assets/workflows.js` — 23 конфигурации переиспользуемых workflow-промптов;
- `assets/workflow-page.js` — data-driven renderer форм;
- `assets/catalog.js` — поиск и группировка каталога.

Новые workflow-страницы являются лёгкими оболочками. Поля, требования, порядок работы и формат результата хранятся централизованно в `assets/workflows.js`, поэтому функциональный и визуальный стиль не расходится между страницами.

## Общий функционал

- единая адаптивная навигация;
- поиск по всей библиотеке;
- локальное сохранение черновиков;
- валидация обязательных полей;
- копирование с fallback для `file://`;
- скачивание промпта в `.txt`;
- отсутствие CDN и внешних runtime-зависимостей;
- печатные стили и `prefers-reduced-motion`.

## Проверка

Требуется Node.js 22+:

```bash
node scripts/validate-pages.mjs
```

Smoke-test проверяет 33 HTML-страницы, 23 workflow-конфигурации и shared assets: локальные ссылки, обязательные элементы, дублирующиеся `id`, соответствие `data-workflow`, отсутствие внешних зависимостей и синтаксис JavaScript. Та же команда выполняется workflow `.github/workflows/validate-static.yml`.