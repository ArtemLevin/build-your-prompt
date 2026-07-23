(() => {
  'use strict';

  const f = (name, label, type = 'textarea', options = {}) => ({ name, label, type, ...options });
  const s = (title, fields) => ({ title, fields });

  const definitions = {
    'agentkit-pr-planner': {
      title: 'Планирование PR', eyebrow: 'AgentKit · planning', category: 'agentkit', icon: '🧭', tag: 'Plan',
      description: 'Доказательный план одного логически цельного PR без преждевременной реализации.',
      role: 'senior software engineer и change planner', agentkit: true,
      objective: 'подготовить детальный, проверяемый и минимальный план отдельного Pull Request',
      sections: [
        s('Контекст', [f('project','Проект','text',{required:true}), f('goal','Цель PR','textarea',{required:true}), f('problem','Проблема или требование','textarea',{required:true}), f('findings','Finding ID / исходные материалы')]),
        s('Границы', [f('scope','Допустимый scope','textarea',{required:true}), f('forbidden','Запрещённые изменения'), f('compatibility','Ограничения совместимости'), f('subsystems','Затронутые подсистемы')]),
        s('Поставка', [f('tests','Обязательные проверки'), f('migration','Миграции и данные'), f('git','Разрешённые Git-действия','select',{options:['без commit/push/PR','разрешены commit и push','разрешён draft PR, merge запрещён']})])
      ],
      workflow: ['прочитать проектные инструкции и релевантные AgentKit skills','повторно проверить исходную проблему по коду и тестам','через graph.json определить entry points, invariant owners, callers и соседние тесты','разделить обязательный scope, non-goals и compatibility constraints','спроектировать минимальную последовательность изменений без написания production-кода','провести risk review плана и исключить несвязанный рефакторинг'],
      deliverables: ['requirements contract','карта execution paths и затронутых файлов','пошаговый план изменений','матрица тестов по рискам','миграционная и rollback-стратегия','риски и зависимости','Definition of Done','структура описания draft PR'],
      rules: ['не реализовывать код','не планировать rewrite без доказанной необходимости','один PR — одна логическая цель','каждый шаг должен иметь проверяемый результат']
    },
    'agentkit-feature-implementation': {
      title: 'Реализация функции', eyebrow: 'AgentKit · implementation', category: 'agentkit', icon: '⚙', tag: 'Feature',
      description: 'Реализация новой возможности по требованиям или готовому плану с минимальным diff.',
      role: 'senior software engineer', agentkit: true,
      objective: 'реализовать новую функцию в существующем репозитории с доказательной проверкой требований',
      sections: [
        s('Функция', [f('project','Проект','text',{required:true}), f('feature','Описание функции','textarea',{required:true}), f('value','Пользовательская ценность'), f('criteria','Acceptance criteria','textarea',{required:true})]),
        s('Контракт', [f('plan','Существующий план или ADR'), f('scope','Обязательный scope'), f('forbidden','Запрещённые изменения'), f('api','Публичные API и форматы данных'), f('migration','Миграции и совместимость')]),
        s('Проверка и Git', [f('tests','Обязательные тесты'), f('git','Разрешённые Git-действия','select',{options:['без commit/push/PR','commit и push разрешены','draft PR разрешён, merge запрещён']})])
      ],
      workflow: ['проверить требования и готовый план по фактическому коду','найти invariant owner, entry points, callers и тесты через graph.json и исходники','сформировать краткий контракт реализации и порядок изменений','реализовать минимальный вертикальный срез','добавить regression, integration или contract tests по рискам','выполнить точечные и затем широкие проверки','провести adversarial review diff и устранить подтверждённые регрессии'],
      deliverables: ['реализованная функция','список изменённых файлов','тесты и результаты команд','проверка acceptance criteria','compatibility/migration impact','остаточные риски','draft PR при явном разрешении'],
      rules: ['не расширять scope','не создавать второй source of truth','не менять API/schema без необходимости','не ослаблять тесты','не выполнять merge']
    },
    'agentkit-pr-review': {
      title: 'Проверка готовности PR', eyebrow: 'AgentKit · review', category: 'agentkit', icon: '🔬', tag: 'PR review',
      description: 'Строгое ревью diff перед merge: scope, regressions, миграции, тесты и rollback.',
      role: 'senior code reviewer и release gatekeeper', agentkit: true,
      objective: 'оценить корректность и merge-readiness конкретного Pull Request',
      sections: [
        s('Pull Request', [f('project','Проект','text',{required:true}), f('pr','Номер PR / диапазон commits','text',{required:true}), f('goal','Заявленная цель','textarea',{required:true}), f('criteria','Acceptance criteria')]),
        s('Риски', [f('risk','Уровень риска','select',{options:['низкий','средний','высокий','критический']}), f('migration','Ожидаемые миграции'), f('platforms','Поддерживаемые платформы'), f('checks','Обязательные проверки')]),
        s('Режим', [f('reviewMode','Действия','select',{options:['только read-only ревью','разрешены локальные исправления без Git','разрешены исправления и push в ветку PR']})])
      ],
      workflow: ['прочитать diff, описание PR, проектные инструкции и релевантные skills','сопоставить изменения с целью и acceptance criteria','через graph.json проверить затронутых callers, контракты и тесты','искать скрытое расширение scope, regressions, data/API incompatibility и migration hazards','проверить тестовую достаточность, rollback и документацию','провести adversarial pass и удалить недоказанные findings'],
      deliverables: ['summary diff и scope','confirmed findings P0–P3','матрица acceptance criteria','migration и rollback verdict','test adequacy report','результаты проверок','merge-ready / changes-required verdict'],
      rules: ['finding только с доказательством','не считать стиль блокером','не менять код в read-only режиме','merge не выполнять']
    },
    'agentkit-release-readiness': {
      title: 'Готовность релиза', eyebrow: 'AgentKit · release', category: 'agentkit', icon: '🚦', tag: 'Release',
      description: 'Go/no-go аудит версии: миграции, deployment, rollback, SLO и восстановление.',
      role: 'release engineer, SRE и security reviewer', agentkit: true,
      objective: 'провести production-readiness gate для планируемого релиза',
      sections: [
        s('Релиз', [f('project','Проект','text',{required:true}), f('version','Версия','text',{required:true}), f('scope','Release scope','textarea',{required:true}), f('infra','Целевая инфраструктура')]),
        s('Эксплуатация', [f('deployment','Deployment strategy'), f('slo','SLO / error budget'), f('backup','Backup / restore'), f('migration','Миграции'), f('rollback','Rollback strategy')]),
        s('Gates', [f('observability','Observability'), f('security','Security gates'), f('load','Load profile'), f('platforms','Поддерживаемые платформы')])
      ],
      workflow: ['проверить release scope, changelog и фактический diff','оценить миграции, обратную совместимость и порядок deployment','проверить backup/restore, rollback и аварийные сценарии','проверить security, observability, capacity и platform support','сформировать pre-deploy, smoke и post-deploy проверки','выдать доказательный go/no-go verdict'],
      deliverables: ['release checklist','blocking findings','migration rehearsal plan','backup/restore evidence','rollback runbook','smoke и post-deploy tests','monitoring watchlist','go/no-go verdict'],
      rules: ['не объявлять готовность без выполненных gates','не подменять restore drill наличием backup','каждый блокер должен иметь owner и способ закрытия']
    },
    'agentkit-incident-debug': {
      title: 'Расследование неисправности', eyebrow: 'AgentKit · incident', category: 'agentkit', icon: '🧯', tag: 'Debug',
      description: 'Root-cause анализ traceback, зависания, повреждения данных или платформенного сбоя.',
      role: 'senior incident investigator и Python debugger', agentkit: true,
      objective: 'локализовать первопричину неисправности и подготовить минимальное безопасное исправление',
      sections: [
        s('Симптом', [f('project','Проект','text',{required:true}), f('error','Ошибка / traceback / лог','textarea',{required:true}), f('expected','Ожидаемое поведение','textarea',{required:true}), f('repro','Шаги воспроизведения')]),
        s('Окружение', [f('environment','ОС, версии, зависимости'), f('changes','Последние изменения'), f('data','Затронутые данные'), f('frequency','Частота и условия'), f('workaround','Текущий обходной путь')]),
        s('Полномочия', [f('permission','Разрешение на изменения','select',{options:['только диагностика','разрешены локальные исправления','разрешены commit/push/draft PR']})])
      ],
      workflow: ['отделить факты, симптомы и гипотезы','через graph.json и код восстановить execution path','предложить минимальные диагностические эксперименты с ожидаемыми результатами','проверить lifecycle, concurrency, platform specifics и partial failure','подтвердить root cause до изменения кода','добавить воспроизводящий тест и минимальное исправление при разрешении','провести post-fix adversarial review'],
      deliverables: ['timeline и фактология','дерево гипотез','execution path','результаты экспериментов','root cause','исправление и regression test','остаточные риски','краткий postmortem'],
      rules: ['не чинить симптом вместо причины','не скрывать ошибку fallback-механизмом','не менять несвязанные модули','не заявлять root cause без доказательства']
    },
    'agentkit-architecture-evolution': {
      title: 'Эволюция архитектуры', eyebrow: 'AgentKit · architecture', category: 'agentkit', icon: '🧩', tag: 'Evolution',
      description: 'Переход существующего сервиса к целевой архитектуре через совместимые промежуточные состояния.',
      role: 'senior software architect и migration planner', agentkit: true,
      objective: 'спроектировать безопасное развитие существующей архитектуры без big-bang rewrite',
      sections: [
        s('Текущее состояние', [f('project','Проект','text',{required:true}), f('problem','Архитектурная проблема','textarea',{required:true}), f('requirements','Изменившиеся требования','textarea',{required:true}), f('current','Текущая архитектура и ограничения')]),
        s('Цель перехода', [f('target','Целевое состояние','textarea',{required:true}), f('breaking','Допустимые несовместимые изменения'), f('window','Период и ограничения миграции'), f('data','Данные и миграции'), f('integrations','Интеграции и внешние контракты')])
      ],
      workflow: ['построить current-state map по коду и graph.json','выделить архитектурные силы, инварианты и источники истины','предложить 2–3 стратегии перехода и trade-offs','выбрать последовательность совместимых промежуточных состояний','спроектировать dual-read/write или strangler только при необходимости','разделить переход на независимые PR с rollback на каждом этапе'],
      deliverables: ['current/target architecture maps','ADR и отвергнутые альтернативы','migration dependency graph','промежуточные совместимые состояния','data/API migration plan','roadmap PR','rollback и exit criteria'],
      rules: ['не предлагать big-bang rewrite без доказательства','сохранять работоспособность между этапами','один source of truth на каждом этапе','явно ограничивать период двойной записи']
    },

    'lesson-materials-pipeline': {
      title: 'Материалы занятия', eyebrow: 'Teaching · pipeline', category: 'students', icon: '🎒', tag: 'Lesson pipeline',
      description: 'Полный конвейер: транскрипт и изображения → LaTeX, PDF, постер, web и сайт ученика.',
      role: 'методист, редактор образовательных материалов и web-разработчик',
      objective: 'обработать материалы занятия и выпустить согласованный комплект учебных артефактов',
      sections: [
        s('Занятие', [f('student','Ученик','text',{required:true}), f('subject','Предмет','text',{required:true}), f('date','Дата','text',{required:true}), f('topic','Тема'), f('level','Класс / уровень')]),
        s('Источники', [f('sources','Пути к транскрипту и изображениям','textarea',{required:true}), f('prompts','Пути к pipeline-prompts'), f('repo','Репозиторий и корневая директория')]),
        s('Результаты', [f('artifacts','Нужные артефакты','textarea',{placeholder:'LaTeX, PDF, PNG, HTML...'}), f('paths','Пути вывода'), f('site','Требования к интеграции в сайт'), f('git','Публикация','select',{options:['без Git-действий','commit и push','отдельная ветка и draft PR']})])
      ],
      workflow: ['извлечь весь образовательный контент без потерь','сверить тему, формулы, примеры и задания между источниками','создать требуемые артефакты по соответствующим промптам','обеспечить содержательную эквивалентность LaTeX, web и постера','встроить ссылки, скачивание и раскрываемые изображения в сайт ученика','убрать техническую информацию из ученического интерфейса','проверить файлы, локальные ссылки, компиляцию и браузерный сценарий'],
      deliverables: ['готовые артефакты','обновлённая страница ученика','матрица покрытия исходного материала','результаты компиляции и статических проверок','перечень изменённых файлов','Git-поставка при разрешении'],
      rules: ['не сокращать учебный материал без основания','не показывать ученику внутренние пути и служебные статусы','не изменять материалы других учеников','математическая и химическая корректность приоритетна']
    },
    'lesson-transcript-analysis': {
      title: 'Анализ транскрипта урока', eyebrow: 'Teaching · analysis', category: 'students', icon: '🎧', tag: 'Transcript',
      description: 'Структурированный педагогический анализ занятия и данные для следующего урока.',
      role: 'опытный преподаватель, методист и образовательный аналитик',
      objective: 'проанализировать транскрипт занятия и выделить доказательные педагогические выводы',
      sections: [
        s('Контекст', [f('subject','Предмет','text',{required:true}), f('level','Класс / экзамен'), f('topic','Тема'), f('goals','Цели занятия')]),
        s('Материал', [f('transcript','Транскрипт или путь к файлу','textarea',{required:true}), f('depth','Глубина анализа','select',{options:['краткая','стандартная','подробная']}), f('format','Формат результата','select',{options:['отчёт преподавателю','данные для CRM/БД','отчёт + план следующего урока']})])
      ],
      workflow: ['отделить речь преподавателя от действий и ответов ученика','восстановить фактически изученные понятия и задачи','найти ошибки, затруднения, подсказки и степень самостоятельности','оценить сильные стороны и устойчивость навыков','выделить незавершённые темы и педагогические риски','сформировать предложения для домашней работы и следующего занятия'],
      deliverables: ['краткое содержание урока','изученные понятия и навыки','ошибки и их вероятные причины','сильные стороны','оценка самостоятельности','домашняя работа','план следующего урока','обновления для competency heatmap'],
      rules: ['не приписывать ученику знания без доказательства в транскрипте','отделять наблюдение от интерпретации','не публиковать технические детали распознавания']
    },
    'next-lesson-planner': {
      title: 'План следующего занятия', eyebrow: 'Teaching · planning', category: 'students', icon: '🗓', tag: 'Lesson plan',
      description: 'Индивидуальный сценарий занятия по результатам предыдущей работы ученика.',
      role: 'опытный преподаватель и instructional designer',
      objective: 'составить персонализированный и реалистичный план следующего занятия',
      sections: [
        s('Ученик', [f('student','Ученик','text',{required:true}), f('subject','Предмет','text',{required:true}), f('goal','Долгосрочная цель'), f('deadline','Срок до экзамена / контрольной')]),
        s('Диагностика', [f('last','Что было на прошлом уроке','textarea',{required:true}), f('gaps','Обнаруженные пробелы'), f('homework','Результат домашней работы'), f('pace','Темп и особенности ученика')]),
        s('Ограничения', [f('duration','Продолжительность занятия','text',{required:true}), f('materials','Доступные материалы'), f('format','Формат','select',{options:['онлайн','очно','смешанный']})])
      ],
      workflow: ['сформулировать 2–4 измеримые цели занятия','начать с короткой диагностики именно выявленных пробелов','распределить время между объяснением, guided practice и самостоятельной работой','заложить точки проверки понимания и адаптивные развилки','подобрать домашнюю работу, связанную с целями урока','определить критерии успешного завершения'],
      deliverables: ['поминутный план','цели и критерии успеха','диагностический старт','объяснение и примеры','guided и independent practice','адаптивные ветки','рефлексия','домашняя работа'],
      rules: ['не перегружать урок количеством тем','каждый этап должен поддерживать цель','учитывать фактический темп ученика']
    },
    'student-work-review': {
      title: 'Проверка работы ученика', eyebrow: 'Teaching · assessment', category: 'students', icon: '📝', tag: 'Review',
      description: 'Проверка ответов, классификация ошибок и персональный план коррекции.',
      role: 'предметный эксперт, экзаменационный проверяющий и методист',
      objective: 'проверить выполненную работу ученика и превратить ошибки в план обучения',
      sections: [
        s('Работа', [f('subject','Предмет','text',{required:true}), f('level','Класс / экзамен'), f('tasks','Условия задач или путь','textarea',{required:true}), f('studentAnswers','Ответы и решения ученика','textarea',{required:true})]),
        s('Проверка', [f('reference','Эталонные ответы / решения'), f('rubric','Система оценивания'), f('strictness','Строгость','select',{options:['обучающая','обычная','экзаменационная']}), f('output','Адресат','select',{options:['преподавателю','ученику','преподавателю и ученику']})])
      ],
      workflow: ['независимо решить или проверить каждое задание','сопоставить ход решения ученика с условием и критериями','разделить вычислительные, концептуальные, логические и оформительские ошибки','определить первопричины и потерянные баллы','выделить устойчивые навыки и случайные успехи','подобрать минимальный набор коррекционных упражнений'],
      deliverables: ['проверка по задачам','баллы и основания','классификация ошибок','первопричины','сильные стороны','темы для повторения','персональные упражнения','данные для heatmap'],
      rules: ['не снижать балл без критерия','не считать иной корректный метод ошибкой','математические ответы проверять независимо']
    },
    'student-progress-report': {
      title: 'Отчёт о прогрессе', eyebrow: 'Teaching · communication', category: 'students', icon: '🌱', tag: 'Progress',
      description: 'Понятный отчёт за период для преподавателя, ученика или родителя.',
      role: 'преподаватель и образовательный аналитик',
      objective: 'подготовить честный, конкретный и доброжелательный отчёт о прогрессе ученика',
      sections: [
        s('Период', [f('student','Ученик','text',{required:true}), f('subject','Предмет','text',{required:true}), f('period','Период','text',{required:true}), f('audience','Адресат','select',{options:['преподаватель','ученик','родитель','ученик и родитель']})]),
        s('Данные', [f('lessons','Посещённые занятия и темы','textarea',{required:true}), f('results','Результаты и динамика'), f('homework','Домашние работы'), f('strengths','Сильные стороны'), f('difficulties','Трудности'), f('next','Следующий этап')]),
        s('Стиль', [f('tone','Тон','select',{options:['деловой','доброжелательный','поддерживающий и мотивирующий']}), f('length','Объём','select',{options:['краткий','стандартный','подробный']})])
      ],
      workflow: ['опираться только на предоставленные факты','показать динамику, а не перечисление тем','отделить освоенные навыки от навыков в развитии','объяснить трудности без ярлыков','сформулировать конкретные следующие действия','адаптировать терминологию под адресата'],
      deliverables: ['summary периода','достижения','зоны роста','динамика','рекомендации','план следующего этапа','при необходимости — вопросы родителю или ученику'],
      rules: ['не сравнивать с другими учениками','не обещать гарантированный результат','избегать технического и оценочного жаргона для родителей']
    },
    'competency-heatmap': {
      title: 'Карта компетенций', eyebrow: 'Teaching · analytics', category: 'students', icon: '◎', tag: 'Heatmap',
      description: 'Проектирование или безопасное обновление детализированной карты тем и навыков.',
      role: 'методист, аналитик образовательных данных и frontend-разработчик',
      objective: 'создать или обновить карту компетенций без потери существующего прогресса',
      sections: [
        s('Модель', [f('subject','Предмет','text',{required:true}), f('exam','Экзамен / программа'), f('rubric','Рубрикация тем','textarea',{required:true}), f('current','Текущая структура карты или путь')]),
        s('Прогресс', [f('studied','Изученные темы и уровни','textarea',{required:true}), f('evidence','Даты и доказательства освоения'), f('scale','Шкала владения'), f('visual','Тип визуализации','select',{options:['круговая карта с кольцами','иерархическая heatmap','матрица тема × навык']})]),
        s('Интеграция', [f('page','Путь к странице ученика'), f('requirements','Дополнительные требования')])
      ],
      workflow: ['сохранить существующие идентификаторы и прогресс','нормализовать рубрикацию до атомарных навыков','спроектировать сектора, кольца или уровни детализации','отдельно хранить структуру компетенций и факты освоения','добавить легенду, динамику и диагностические состояния','проверить rendering, mobile layout и восстановление данных'],
      deliverables: ['модель компетенций','схема визуализации','правила агрегации прогресса','обновлённый UI или техническое задание','миграция существующих данных','проверки против сброса изученных тем'],
      rules: ['не сбрасывать прогресс при изменении рубрикации','не смешивать “изучено” и “освоено”','не упоминать внешние источники рубрикации на ученической странице без запроса']
    },

    'diagnostic-assessment': {
      title: 'Диагностическая работа', eyebrow: 'Education · assessment', category: 'education', icon: '🧪', tag: 'Diagnostic',
      description: 'Работа, где каждое задание измеряет конкретную компетенцию и даёт интерпретируемый результат.',
      role: 'предметный методист и разработчик диагностических материалов',
      objective: 'создать валидную диагностическую работу и схему интерпретации результатов',
      sections: [
        s('Параметры', [f('subject','Предмет','text',{required:true}), f('level','Класс / уровень','text',{required:true}), f('competencies','Компетенции','textarea',{required:true}), f('count','Количество задач','text',{required:true}), f('time','Время')]),
        s('Оценивание', [f('difficulty','Распределение сложности'), f('score','Баллы'), f('answers','Формат ответов'), f('classification','Правила классификации ошибок'), f('format','Формат выдачи')])
      ],
      workflow: ['построить матрицу компетенция → наблюдаемый навык → задание','создать независимые и недвусмысленные задания','проверить решения, ответы и уровень программы','назначить баллы по диагностической ценности','описать интерпретацию профиля результатов','предложить учебные действия для каждого типа дефицита'],
      deliverables: ['диагностическая работа','ответы и решения','rubric','матрица задача → навык','пороговые уровни','интерпретация результата','рекомендации по обучению'],
      rules: ['одно задание не должно одновременно скрыто измерять слишком много навыков','не использовать непроверяемые формулировки','каждый ответ проверить независимо']
    },
    'math-content-audit': {
      title: 'Аудит математического контента', eyebrow: 'Education · quality', category: 'education', icon: '∴', tag: 'Math QA',
      description: 'Независимая проверка задач, решений, ответов, ОДЗ и геометрических конфигураций.',
      role: 'академический математик и редактор учебных материалов',
      objective: 'провести строгую независимую ревизию математического контента перед публикацией',
      sections: [
        s('Материал', [f('level','Класс / экзамен','text',{required:true}), f('tasks','Задачи','textarea',{required:true}), f('answers','Ответы'), f('solutions','Решения'), f('methods','Разрешённые методы')]),
        s('Проверка', [f('focus','Особый фокус'), f('format','Формат отчёта','select',{options:['только ошибки','полный аудит','аудит + исправленные версии']})])
      ],
      workflow: ['независимо решить каждую задачу','проверить существование, однозначность и полноту ответа','проверить ОДЗ, особые и вырожденные случаи','проверить соответствие условия, решения и ответа','проверить геометрическую непротиворечивость и реалистичность данных','оценить соответствие заявленному уровню'],
      deliverables: ['таблица статусов по задачам','подтверждённые ошибки','контрпримеры или вычисления','исправленные формулировки','проверенные ответы','риски неоднозначности','итоговый publish/no-publish verdict'],
      rules: ['не доверять готовому ответу','не менять стиль задачи без необходимости','каждую ошибку подтверждать расчётом или логикой']
    },
    'learning-site-architect': {
      title: 'Архитектура учебного сайта', eyebrow: 'Education · course', category: 'education', icon: '🗺', tag: 'Learning site',
      description: 'Проектирование полноценного образовательного сайта или курса, а не одной страницы.',
      role: 'instructional designer, curriculum architect и frontend architect',
      objective: 'спроектировать образовательный сайт с последовательной программой, практикой и контролем знаний',
      sections: [
        s('Курс', [f('subject','Предмет / стек','text',{required:true}), f('audience','Целевая аудитория','textarea',{required:true}), f('start','Начальный уровень'), f('target','Конечный уровень','textarea',{required:true}), f('modules','Модули и темы','textarea',{required:true})]),
        s('Опыт обучения', [f('format','Формат обучения'), f('interactive','Интерактивы'), f('assessment','Контроль знаний'), f('design','Дизайн'), f('offline','Offline-требования'), f('math','Формат математики')])
      ],
      workflow: ['сформировать карту результатов обучения и prerequisites','разделить программу на модули с критериями перехода','спроектировать дерево страниц и навигацию','связать теорию, примеры, практику, квизы и проекты','определить accessibility, mobile, print и offline требования','создать roadmap реализации и проверки качества контента'],
      deliverables: ['curriculum map','information architecture','дерево страниц','шаблоны типов страниц','progression и checkpoints','assessment strategy','UX/accessibility requirements','roadmap реализации'],
      rules: ['не превращать курс в набор несвязанных статей','каждый модуль должен иметь измеримый outcome','не добавлять интерактивность без педагогической функции']
    },
    'educational-mind-map': {
      title: 'Ментальная карта темы', eyebrow: 'Education · visualization', category: 'education', icon: '✺', tag: 'Mind map',
      description: 'Детализированная визуальная карта понятий, формул, связей, примеров и ошибок.',
      role: 'методист и information designer',
      objective: 'спроектировать содержательную ментальную карту учебной темы',
      sections: [
        s('Содержание', [f('topic','Тема','text',{required:true}), f('level','Уровень','text',{required:true}), f('center','Центральное понятие'), f('branches','Обязательные ветви','textarea',{required:true}), f('depth','Глубина')]),
        s('Наполнение', [f('formulas','Формулы'), f('errors','Типичные ошибки'), f('examples','Примеры'), f('style','Визуальный стиль','select',{options:['акварель','академический','hand-drawn','техническая схема','минималистичный']}), f('output','Формат','select',{options:['промпт для изображения','Mermaid mindmap','структура для HTML/SVG']})])
      ],
      workflow: ['выделить центральное понятие и иерархию ветвей','показать причинные, логические и процессные связи','разместить формулы и примеры рядом с соответствующими понятиями','отдельно отметить типичные ошибки и контрольные вопросы','ограничить глубину, чтобы карта оставалась читаемой','адаптировать композицию под выбранный формат'],
      deliverables: ['иерархическая структура карты','тексты узлов','связи и перекрёстные связи','легенда визуальных кодов','готовый промпт или Mermaid/SVG specification'],
      rules: ['не использовать декоративные ветви без содержания','не искажать формулы ради дизайна','сохранять читаемость на целевом размере']
    },

    'learning-lab-generator': {
      title: 'Учебный лабораторный стенд', eyebrow: 'DevOps · lab', category: 'devops', icon: '🧰', tag: 'Lab',
      description: 'Практический стенд по облакам, Linux, Docker, Ansible, CI/CD или Python.',
      role: 'DevOps-инженер, преподаватель и автор лабораторных работ',
      objective: 'спроектировать безопасный и воспроизводимый учебный стенд по выбранной технологии',
      sections: [
        s('Обучение', [f('technology','Технология','text',{required:true}), f('level','Текущий уровень'), f('topics','Целевые темы','textarea',{required:true}), f('duration','Продолжительность'), f('platform','Облако или локальная среда')]),
        s('Ограничения', [f('budget','Бюджет'), f('os','ОС'), f('tools','Обязательные инструменты'), f('hardware','Доступное оборудование'), f('cleanup','Требования к удалению ресурсов')])
      ],
      workflow: ['определить минимальную архитектуру стенда','разбить работу на нарастающие лабораторные этапы','для каждого этапа дать цель, команды, файлы и проверку','добавить преднамеренные диагностические задачи и типичные ошибки','учесть безопасность, стоимость и идемпотентность','завершить полным cleanup и проверкой отсутствия платных ресурсов'],
      deliverables: ['архитектура стенда','пошаговые лабораторные работы','скрипты и конфигурации','контрольные вопросы','диагностика ошибок','критерии освоения','cleanup runbook'],
      rules: ['не создавать дорогие ресурсы без необходимости','команды должны быть воспроизводимыми','каждый этап должен иметь observable result']
    },
    'infrastructure-explainer': {
      title: 'Объяснение инфраструктурного проекта', eyebrow: 'DevOps · explain', category: 'devops', icon: '🔭', tag: 'Explain',
      description: 'Разбор cloud-init, CLI, inventory, playbooks и pipeline от общего к частному.',
      role: 'DevOps-наставник, умеющий объяснять начинающим без потери технической точности',
      objective: 'пошагово объяснить существующий инфраструктурный проект и логику его решений',
      sections: [
        s('Материалы', [f('project','Скрипты и конфигурации','textarea',{required:true}), f('technology','Технологии'), f('goal','Цель стенда'), f('level','Уровень ученика','select',{options:['начинающий','junior','middle']}), f('depth','Глубина','select',{options:['обзор','подробно','максимально подробно малыми шагами']})]),
        s('Фокус', [f('questions','Конкретные вопросы'), f('environment','Окружение'), f('alternatives','Нужно ли сравнение альтернатив')])
      ],
      workflow: ['сначала объяснить общую архитектуру и поток данных','затем разобрать каждый файл, блок и команду','показать входы, выходы и зависимости между этапами','объяснить причины выбора и доступные альтернативы','перечислить типичные ошибки и диагностические команды','добавить безопасные эксперименты для самостоятельного закрепления'],
      deliverables: ['карта проекта','пошаговый разбор','справочник команд','альтернативы и trade-offs','ошибки и диагностика','хитрости','мини-задания для закрепления'],
      rules: ['не пропускать скрытые предпосылки','не использовать термин без объяснения на выбранном уровне','не предлагать опасные команды без предупреждения']
    },
    'ansible-project-generator': {
      title: 'Генератор Ansible-проекта', eyebrow: 'DevOps · Ansible', category: 'devops', icon: 'A', tag: 'Ansible',
      description: 'Inventory, roles, templates, handlers, Vault, filters и проверки идемпотентности.',
      role: 'senior Ansible и Linux automation engineer',
      objective: 'создать структурированный и идемпотентный Ansible-проект под заданный стенд',
      sections: [
        s('Инфраструктура', [f('hosts','Хосты и группы','textarea',{required:true}), f('os','ОС','text',{required:true}), f('roles','Нужные роли','textarea',{required:true}), f('packages','Пакеты и сервисы'), f('cloud','Целевая среда')]),
        s('Автоматизация', [f('variables','Переменные'), f('templates','Templates'), f('handlers','Handlers'), f('secrets','Секреты и Vault'), f('filters','Filters'), f('tests','Lint / Molecule / smoke tests'), f('constraints','Ограничения')])
      ],
      workflow: ['спроектировать inventory и variable precedence','разделить функциональность на роли с ясными defaults и handlers','использовать templates и modules вместо shell, где возможно','вынести секреты в Vault и показать безопасный workflow','обеспечить идемпотентность и корректные changed states','добавить lint, check mode, повторный запуск и smoke-проверки'],
      deliverables: ['дерево проекта','inventory','playbooks и roles','templates/handlers/vars','Vault workflow','команды запуска','проверки идемпотентности','cleanup или rollback'],
      rules: ['не хранить секреты открытым текстом','не использовать shell без необходимости','повторный запуск не должен ломать систему']
    },
    'learning-roadmap': {
      title: 'Roadmap изучения технологии', eyebrow: 'Learning · roadmap', category: 'devops', icon: '↗', tag: 'Roadmap',
      description: 'Путь от текущего уровня к целевому с проектами, критериями перехода и повторением.',
      role: 'senior practitioner и curriculum designer',
      objective: 'составить реалистичный поэтапный roadmap изучения технологии или профессионального направления',
      sections: [
        s('Цель', [f('technology','Технология / роль','text',{required:true}), f('current','Текущий уровень','textarea',{required:true}), f('target','Целевой уровень','textarea',{required:true}), f('deadline','Срок'), f('hours','Часов в неделю')]),
        s('Условия', [f('format','Предпочтительный формат обучения'), f('hardware','Оборудование'), f('projects','Желаемые проекты'), f('career','Собеседования / сертификация'), f('constraints','Ограничения')])
      ],
      workflow: ['провести gap analysis между текущим и целевым уровнем','разделить путь на этапы с prerequisites','для каждой темы связать теорию, практику и проект','определить критерии перехода и контрольные точки','заложить интервальное повторение и диагностику пробелов','сформировать portfolio outcomes'],
      deliverables: ['карта этапов','понедельный или помесячный план','темы и упражнения','проекты','критерии перехода','контрольные работы','план повторения','результаты для портфолио'],
      rules: ['не перегружать срок нереалистичным объёмом','не переходить к следующему этапу без observable criteria','адаптировать инструменты под оборудование']
    },

    'local-llm-selector': {
      title: 'Выбор локальной LLM', eyebrow: 'AI · local models', category: 'ai', icon: '◈', tag: 'LLM',
      description: 'Подбор модели и квантования под железо, Ollama, задачи, контекст и лицензию.',
      role: 'инженер локальных LLM и benchmark designer',
      objective: 'подобрать актуальные локальные модели и план их объективного сравнения',
      currentVerification: true,
      sections: [
        s('Оборудование', [f('cpu','CPU'), f('gpu','GPU и VRAM'), f('ram','RAM','text',{required:true}), f('os','ОС'), f('runtime','Runtime','select',{options:['Ollama','llama.cpp','LM Studio','другое']})]),
        s('Требования', [f('size','Максимальный размер / квантование'), f('tasks','Задачи','textarea',{required:true}), f('languages','Языки'), f('context','Контекст'), f('priority','Приоритет','select',{options:['качество','скорость','баланс']}), f('license','Ограничения лицензии')])
      ],
      workflow: ['проверить в интернете актуальные версии, лицензии и доступные кванты','отфильтровать модели по реальным ограничениям RAM/VRAM','предложить 3–5 кандидатов с ожидаемыми trade-offs','рекомендовать конкретные квантования и параметры запуска','создать единый benchmark на пользовательских задачах','сравнить качество, скорость, память и стабильность'],
      deliverables: ['таблица кандидатов','основная рекомендация и запасной вариант','команды установки','параметры контекста и offload','ожидаемая производительность','benchmark dataset и rubric','критерии окончательного выбора'],
      rules: ['обязательно проверять текущую доступность и спецификации','не обещать скорость без пометки об оценке','учитывать общий размер модели, KV-cache и runtime overhead']
    },
    'rag-tutor-architect': {
      title: 'Архитектура RAG-ассистента', eyebrow: 'AI · RAG', category: 'ai', icon: '⧉', tag: 'RAG',
      description: 'Ассистент по учебным материалам: ingestion, retrieval, citations, доступ и evaluation.',
      role: 'AI architect, retrieval engineer и security reviewer',
      objective: 'спроектировать доказательный RAG-ассистент по учебным или корпоративным материалам',
      sections: [
        s('Продукт', [f('users','Пользователи и роли','textarea',{required:true}), f('sources','Источники знаний','textarea',{required:true}), f('formats','Форматы файлов'), f('volume','Объём и частота обновления'), f('model','Локальная или облачная модель')]),
        s('Качество и эксплуатация', [f('citations','Требования к цитатам'), f('access','Права доступа'), f('latency','Latency'), f('cost','Бюджет'), f('offline','Offline'), f('integration','Существующий сервис / интеграция')])
      ],
      workflow: ['сформировать use cases и quality criteria','спроектировать ingestion, parsing, chunking и metadata','выбрать embeddings, retrieval, filtering и reranking','спроектировать answer generation с обязательными citations и abstention','учесть ACL до retrieval и защиту от prompt injection в документах','создать evaluation dataset и production observability','разделить внедрение на проверяемые этапы'],
      deliverables: ['system architecture','ingestion pipeline','index schema и metadata','retrieval/reranking strategy','answer/citation contract','security model','evaluation plan','capacity/cost model','roadmap интеграции'],
      rules: ['не использовать RAG без измеримого выигрыша','не смешивать документы разных ACL','ответ без достаточных источников должен честно воздерживаться']
    },
    'agent-evaluation': {
      title: 'Оценка AI-агента', eyebrow: 'AI · evaluation', category: 'ai', icon: '◇', tag: 'Evals',
      description: 'Golden cases, adversarial scenarios, tool-use tests и regression gate для агента.',
      role: 'AI evaluation engineer и quality lead',
      objective: 'создать воспроизводимую систему оценки качества AI-агента или ассистента',
      sections: [
        s('Агент', [f('purpose','Назначение','textarea',{required:true}), f('tools','Инструменты'), f('queries','Типы запросов','textarea',{required:true}), f('critical','Критические ошибки','textarea',{required:true}), f('constraints','Ограничения')]),
        s('Оценивание', [f('references','Эталонные ответы / данные'), f('budget','Бюджет'), f('latency','Latency'), f('dataset','Формат evaluation dataset'), f('models','Сравниваемые модели / версии')])
      ],
      workflow: ['построить taxonomy задач и failure modes','собрать representative golden cases','добавить adversarial, ambiguous и tool-failure cases','определить автоматические и экспертные метрики','проверять correctness, citations, tool use, safety и abstention','зафиксировать baseline и regression thresholds','спроектировать отчёт сравнения версий'],
      deliverables: ['evaluation taxonomy','dataset schema','golden и adversarial cases','scoring rubric','tool-use tests','hallucination/safety checks','regression gate','шаблон отчёта и decision rule'],
      rules: ['не сводить качество к одной метрике','не использовать тесты из production prompts без контроля leakage','критические ошибки должны иметь отдельные hard gates']
    }
  };

  const categoryOrder = ['agentkit', 'students', 'education', 'devops', 'ai'];
  const categoryLabels = {
    agentkit: 'Разработка с AgentKit',
    students: 'Работа с учениками',
    education: 'Образовательный контент',
    devops: 'Python, DevOps и обучение',
    ai: 'AI и локальные LLM'
  };

  function inputData(definition, form) {
    const rows = [];
    for (const section of definition.sections) {
      for (const field of section.fields) {
        const value = PromptStudio.value(form, field.name);
        rows.push(`${field.label}: ${value || 'не задано'}`);
      }
    }
    return rows.join('\n');
  }

  function agentkitPolicy(definition) {
    if (!definition.agentkit) return '';
    return `\nAGENTKIT И GRAPHIFY\nПрочитай AGENT(S).md, .agent/AGENT.md, .agent/agentkit.toml и только релевантные skills. Выполни triage. Graphify используй только через корневой ./graph.json: не запускай graphify, agentkit graph update или agentkit graph query и не используй graphify-out/graph.json. Граф является навигационным индексом; все INFERRED и неоднозначные связи подтверждай исходным кодом и тестами.\n`;
  }

  function verificationPolicy(definition) {
    return definition.currentVerification
      ? '\nАКТУАЛЬНОСТЬ\nОбязательно выполни web-проверку текущих версий, спецификаций, лицензий, цен и доступности по первичным источникам. Указывай дату проверки и отделяй подтверждённые факты от оценок.\n'
      : '';
  }

  function build(definition, form) {
    const mode = PromptStudio.value(form, 'mode', 'detailed');
    const data = inputData(definition, form);
    const workflow = definition.workflow.map((item, index) => `${index + 1}. ${item}.`).join('\n');
    const deliverables = definition.deliverables.map(item => `- ${item};`).join('\n');
    const rules = definition.rules.map(item => `- ${item};`).join('\n');

    if (mode === 'battle') {
      return `Работай как ${definition.role}. ${definition.objective}.\n\nВХОДНЫЕ ДАННЫЕ\n${data}\n${agentkitPolicy(definition)}${verificationPolicy(definition)}\nПОРЯДОК\n${workflow}\n\nРЕЗУЛЬТАТ\n${deliverables}\n\nОГРАНИЧЕНИЯ\n${rules}\n\nПри незаполненных полях зафиксируй разумные допущения и продолжай. Не выдавай предположение за требование или проверенный факт.`;
    }

    return `Работай как ${definition.role}.\n\nЦЕЛЬ\n${definition.objective}.\n\nВХОДНЫЕ ДАННЫЕ\n${data}\n\nЕсли часть полей не заполнена, не останавливай работу: перечисли допущения, влияние каждого допущения и условие его пересмотра. Не представляй допущения как требования пользователя.${agentkitPolicy(definition)}${verificationPolicy(definition)}\nПОРЯДОК РАБОТЫ\n${workflow}\n\nОБЯЗАТЕЛЬНЫЙ РЕЗУЛЬТАТ\n${deliverables}\n\nЖЁСТКИЕ ОГРАНИЧЕНИЯ\n${rules}\n\nКОНТРОЛЬ КАЧЕСТВА\nПеред завершением проверь полноту входных данных, внутреннюю согласованность результата, соответствие заявленной цели и наличие доказательств для существенных выводов. Явно перечисли выполненные проверки, ограничения анализа и оставшиеся риски.`;
  }

  window.WorkflowCatalog = { definitions, categoryOrder, categoryLabels, build };
})();