lnkto.in
=========
**wknd experiment #1** — полностью serverless приложение для сокращения ссылок.

Простой проект выходного дня, чтобы поиграть с сервисами Яндекс.Облака:

  1. **Certificate Manager** для получения сертификата Let's Encrypt
  2. **API Gateway** для роутинга запросов на Cloud Functions (логика) и Object Storage (фронтенд)
  3. **Cloud Functions** для логики сокращения/разворачивания ссылок
  4. **Yandex Database** для хранения ссылок
