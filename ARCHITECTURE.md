# Архитектура проекта


Разес Фарма/
├── app/
│   ├── Http/Controllers/Api/ # Laravel API-контроллеры
│   ├── Http/Middleware/      # Проверка токена администратора
│   └── Models/               # Eloquent-модели SQLite
├── backend/data/
│       ├── content.json   # Исходный контент и источник первой миграции
│       └── site.db        # Рабочая база SQLite (создаётся автоматически)
├── database/migrations/   # Схема базы и перенос старых JSON-данных
├── routes/                # Web и API-маршруты Laravel
├── public/assets/         # Логотип и изображения сайта
├── src/
│   ├── admin/
│   │   └── Admin.jsx      # Админ-панель и визуальный CMS-редактор
│   ├── app/
│   │   └── App.jsx        # Маршрутизация и запуск React-приложения
│   ├── components/
│   │   ├── layout/
│   │   │   └── SiteLayout.jsx       # Header, Footer, Logo и Layout
│   │   ├── sections/
│   │   │   └── ProductionSections.jsx # HVAC и производство таблеток
│   │   └── ui/
│   │       └── SiteUi.jsx           # Кнопки, карточки, счётчики и PageHero
│   ├── data/siteContent.js # Навигация и каталожные данные
│   ├── pages/
│   │   └── SitePages.jsx  # Шесть публичных страниц сайта
│   ├── main.jsx           # Минимальная точка входа
│   └── styles.css         # Общие стили
├── .env.example           # Пример серверных настроек
├── ADMIN.md               # Инструкция администратора
└── package.json           # Команды и зависимости


# Поток данных

1. React загружает исходное содержимое страниц.
2. `GET /api/content` возвращает изменения администратора.
3. CMS применяет сохранённые значения к соответствующим блокам.
4. Админка отправляет изменения через защищённый `PUT /api/content`.
5. Сервер сохраняет изменения в транзакции SQLite в `backend/data/site.db`.

При первом запуске существующие `content.json`, `applications.json`,
`messages.json` и `credentials.json` автоматически переносятся в SQLite.

`src/main.jsx` подключает приложение, а `src/app/App.jsx` содержит только
маршрутизацию. Публичные страницы, переиспользуемые компоненты и CMS разделены
по самостоятельным модулям. Backend реализован на PHP 8.3+ и Laravel 13,
а доступ к SQLite выполняется через Eloquent и Query Builder.
