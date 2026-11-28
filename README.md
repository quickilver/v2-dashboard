# v2-dashboard

## Локальный запуск

Нужен Node.js 22. Из корня репозитория установите зависимости:

```bash
npm ci
```

Если `src/environments/environment.ts` ещё отсутствует, создайте его из шаблона:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

В `environment.ts` проверьте `apiUrl`. Для локального Laravel API через Docker
используется `http://localhost:8000/api`.

```bash
npm start
```

Дашборд доступен на <http://localhost:4200/>.

## Поиск описания товара

Для кнопки «Заполнить описание» должны работать локальный Laravel API и
обработчик очереди OpenRouter. Из корня репозитория `v2-api`, после применения
миграций, запустите:

```bash
docker compose exec -d -u www-data app php artisan queue:work openrouter --timeout=150
docker compose top app
```

При запуске API без Docker выполните `php artisan queue:work openrouter --timeout=150`
в отдельном терминале. В настройках дашборда укажите ключ `ai-open-router-api-key`
и модель `ai-open-router-model`.
