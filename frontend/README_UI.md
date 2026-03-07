# Diplomayin - Frontend UI

Профессиональная платформа для умного поиска работы с поддержкой трёх языков (английский, русский, армянский).

## 🌟 Особенности

### 🎨 Дизайн
- **Современный градиентный дизайн** - фиолетово-синий градиент (#667eea → #764ba2)
- **Адаптивная верстка** - работает идеально на десктопе, планшете и мобильном
- **Интерактивные компоненты** - плавные анимации и переходы
- **Loading скелеты** - визуальная обратная связь при загрузке данных

### 🌐 Многоязычность
Сайт поддерживает 3 языка с автоматическим переключением:
- 🇬🇧 **English** (Английский)
- 🇷🇺 **Русский** (Русский) 
- 🇦🇲 **Հայերեն** (Армянский)

Переключение языков находится в правом углу хедера. Выбранный язык сохраняется в браузере.

### 📱 Структура Страниц

#### 1. **Главная страница** (`/`)
Структурирована в несколько секций:

**Hero Section**
- Красивый градиентный фон с паттерном
- Название и описание платформы
- Кнопки действия: "Upload CV" и "Browse Jobs"

**Most In-Demand Professions**
- Фильтрация по областям (Technology, Healthcare, Finance, Marketing, Education, Engineering)
- 8+ профессий с информацией:
  - Название и описание должности
  - Уровень спроса (visual bar)
  - Примерный диапазон зарплаты
- Интерактивные карточки с hover эффектами

**Hot Jobs**
- Первые 6 вакансий из базы
- Красивые карточки с информацией
- Ссылка на полное описание вакансии

**Search Section**
- Поле поиска по названию должности или компании
- Динамическая фильтрация
- Полный список всех вакансий

**Footer**
- Информация о компании
- Quick links
- Social media links
- Copyright

#### 2. **Страница деталей вакансии** (`/jobs/:id`)
- Полная информация о должности
- Компания, локация, зарплата
- Полное описание вакансии
- Кнопка "Apply Now"

#### 3. **Загрузка CV** (`/upload`)
- Drag & drop поле для загрузки файла
- Поддержка PDF, DOC, DOCX
- Валидация размера файла (макс 10MB)
- Статусные сообщения

#### 4. **Логин** (`/login`)
- Форма для авторизации
- Обработка ошибок
- Loading состояние

## 🛠 Технический стек

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.14.1",
  "@tanstack/react-query": "^5.7.0",
  "i18next": "^23.x.x",
  "react-i18next": "^13.x.x",
  "axios": "^1.5.0",
  "typescript": "^5.1.6",
  "vite": "^5.2.0"
}
```

## 🚀 Запуск

### Требования
- Node.js 16+
- npm или yarn
- Go 1.19+ (для бэкенда)

### Установка зависимостей
```bash
cd frontend
npm install
```

### Разработка
```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 📚 Использование i18n (многоязычность)

### Структура файлов локализации
```
src/
├── locales/
│   ├── en.json      # Английский
│   ├── ru.json      # Русский
│   └── hy.json      # Армянский
├── i18n.ts          # Конфигурация i18next
└── components/
    └── LanguageSwitcher.tsx  # Компонент переключения языков
```

### Использование переводов в компонентах
```typescript
import { useTranslation } from 'react-i18next'

const MyComponent: React.FC = () => {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>Текущий язык: {i18n.language}</p>
      <button onClick={() => i18n.changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  )
}
```

### Добавление нового языка

1. Создайте файл `src/locales/xx.json` (где xx - код языка)
2. Скопируйте структуру из `en.json`
3. Переведите все значения
4. Обновите `src/i18n.ts`:

```typescript
import xx from './locales/xx.json'

i18n.init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    hy: { translation: hy },
    xx: { translation: xx }  // Добавьте эту строку
  }
})
```

5. Добавьте язык в `LanguageSwitcher.tsx`:

```typescript
const languages = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'hy', label: '🇦🇲 Հայերեն' },
  { code: 'xx', label: '🇽🇽 Language Name' }  // Добавьте эту строку
]
```

## 🎨 Цветовая схема

- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Background Gradient**: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
- **Text Primary**: `#333`
- **Text Secondary**: `#666`
- **Accent**: `#667eea`
- **Success**: `#4caf50`
- **Error**: `#c62828`

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── ProfessionsSection.tsx
│   │   ├── Footer.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── StatsCard.tsx
│   ├── pages/
│   │   ├── VacancyList.tsx
│   │   ├── VacancyDetail.tsx
│   │   ├── Login.tsx
│   │   └── UploadResume.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── jobs.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── locales/
│   │   ├── en.json
│   │   ├── ru.json
│   │   └── hy.json
│   ├── App.tsx
│   ├── main.tsx
│   ├── i18n.ts
│   └── styles.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🔗 API Integration

Фронтенд подключается к бэкенду на `http://localhost:8088`:

**Используемые endpoints:**
- `GET /jobs` - список всех вакансий
- `GET /jobs/:id` - деталь вакансии
- `POST /login` - авторизация
- `POST /upload-cv` - загрузка резюме
- `GET /recommendations?user_id=123` - рекомендуемые вакансии

## 🛡️ Безопасность

- JWT токены сохраняются в localStorage
- Токен автоматически отправляется в заголовке `Authorization`
- CORS настроен на бэкенде для localhost:5173

## 📱 Responsive Design

Сайт оптимизирован для всех размеров экрана:
- **Desktop** (1024px+): полный функционал
- **Tablet** (768px - 1023px): адаптированный layout
- **Mobile** (< 768px): стакированные элементы, мобильное меню

## 🐛 Troubleshooting

### Пустой экран
1. Откройте DevTools (F12)
2. Проверьте консоль на ошибки
3. Убедитесь, что бэкенд работает на :8088
4. Очистите кэш браузера (Ctrl+Shift+Del)

### API ошибки (401, 500)
1. Проверьте, что бэкенд работает: `curl http://localhost:8088/jobs`
2. Проверьте логи бэкенда
3. Убедитесь в CORS конфигурации

### Язык не меняется
1. Откройте DevTools → Console
2. Проверьте, что i18n инициализирован
3. Проверьте, что файлы локализации подгружаются

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Diplomayin Team - 2024

