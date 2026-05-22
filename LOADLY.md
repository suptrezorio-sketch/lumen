# Первый релиз на Loadly.io (LUMEN Bank)

Loadly принимает **только нативные сборки**: `.apk` (Android) или `.ipa` (iOS). Папку `dist/` (PWA) **нельзя** загрузить как приложение — это веб-архив для Netlify, не установочный пакет.

## Что уже проверено в этом репозитории

| Проверка | Результат |
|----------|-----------|
| `npm run build` (корень проекта) | **Успех** — артефакты в `dist/` |
| `capacitor.config.json` | Есть (`appId`: `com.lumen.bank.trainer`, `webDir`: `dist`) |
| Платформа Android (`npx cap add android`) | Добавлена; после `npm run build` выполняйте `npm run cap:sync` |
| Сборка debug APK (`./gradlew assembleDebug`) | **Не готова** — на машине нет Android SDK (`SDK location not found`) |

## Куда положить APK после сборки

После успешной сборки debug-версии файл будет здесь (перетащите его на [loadly.io](https://loadly.io/)):

```text
/Users/panfi.love/Downloads/lumen-bank/android/app/build/outputs/apk/debug/app-debug.apk
```

Release (подписанный) APK обычно:

```text
android/app/build/outputs/apk/release/app-release.apk
```

(точное имя зависит от настроек подписи в Android Studio.)

---

## Шаг 0. Подготовка backend (перед раздачей студентам)

См. [DEPLOY.md](DEPLOY.md): API на Render, PWA на Netlify, переменные `VITE_BACKEND_URL`, Ably, Supabase. Без продакшен-URL приложение в APK откроет пустой или локальный API.

---

## Шаг 1. Собрать веб и синхронизировать Capacitor

```bash
cd /Users/panfi.love/Downloads/lumen-bank
npm install
npm run build
npm run cap:sync
```

---

## Шаг 2. Установить Android SDK (если ещё нет)

1. Установите [Android Studio](https://developer.android.com/studio).
2. В **SDK Manager** установите Android SDK Platform и Build-Tools (версии, которые запросит Gradle при первой сборке).
3. Укажите SDK для Gradle **одним** из способов:
   - переменная окружения `ANDROID_HOME` (часто `~/Library/Android/sdk` на macOS), или
   - файл `android/local.properties` (не коммитьте секреты; файл обычно в `.gitignore`):

```properties
sdk.dir=/Users/ВАШ_ПОЛЬЗОВАТЕЛЬ/Library/Android/sdk
```

---

## Шаг 3. Собрать APK

**Вариант A — командная строка (debug, для класса):**

```bash
cd android
./gradlew assembleDebug
```

**Вариант B — Android Studio (release / подпись):**

```bash
npx cap open android
```

Далее: **Build → Generate Signed Bundle / APK** → APK.

---

## Шаг 4. Первый upload на Loadly (веб-интерфейс)

1. Откройте [https://loadly.io/](https://loadly.io/) (пункт меню **Upload**).
2. При необходимости: **Sign Up** / **Sign In** (аккаунт бесплатный для beta-раздачи).
3. Перетащите файл **`app-debug.apk`** (или подписанный `.apk`) в зону загрузки **или** выберите файл через диалог.
4. Дождитесь обработки: Loadly покажет название, версию, размер, **QR-код** и **короткую ссылку** на установку.
5. (Опционально) Задайте пароль установки, срок действия ссылки, описание обновления — в карточке приложения после загрузки.
6. Разошлите студентам **QR** или ссылку. На Android: разрешить установку из неизвестных источников для браузера/файлового менеджера, если система спросит.

**iOS:** нужен Mac, Xcode, профиль Apple Developer (Ad Hoc / Enterprise), файл `.ipa` — см. раздел ниже. Loadly для iOS использует установку через `itms-services` (как TestFlight/Diawi).

---

## Шаг 5. API (по желанию, без ключей в git)

Документация: [loadly.io/doc/view/api](https://loadly.io/doc/view/api)

- Ключ `_api_key` берётся в личном кабинете Loadly (**не** добавляйте в репозиторий).
- Загрузка: `POST https://api.loadly.io/apiv2/app/upload`, `multipart/form-data`, поля `_api_key` и `file` (`.apk` или `.ipa`).
- Пример из документации Loadly — только с подстановкой ключа из окружения:

```bash
export LOADLY_API_KEY="ваш_ключ_из_кабинета"
curl -F "_api_key=$LOADLY_API_KEY" -F "file=@android/app/build/outputs/apk/debug/app-debug.apk" \
  https://api.loadly.io/apiv2/app/upload
```

Ответ JSON содержит `buildShortcutUrl`, `buildQRCodeURL` и `buildKey` для ссылок и обновлений.

---

## iOS (.ipa) — отдельно

- Требуется **macOS**, **Xcode**, учётная запись **Apple Developer**.
- `npx cap add ios` (только на Mac), затем `npm run cap:sync`, `npx cap open ios` → **Product → Archive** → Export **.ipa**.
- Ad Hoc: UDID устройств в профиле; Enterprise — отдельный тип аккаунта.
- Загрузка на Loadly — тот же drag-and-drop или API с файлом `.ipa`.

---

## Типичные блокеры

| Проблема | Что сделать |
|----------|-------------|
| Нет Android SDK | Android Studio + `sdk.dir` / `ANDROID_HOME` |
| Gradle: SDK location not found | Создать `android/local.properties` с `sdk.dir=...` |
| Загрузили только `dist/` | Собрать Capacitor → `.apk` / `.ipa` |
| Приложение не подключается к API | Задеплоить backend и прописать `VITE_*` перед `npm run build` |
| iOS не ставится | Профиль, UDID, Developer Mode, доверие сертификату |
| Нужен API-ключ в CI | Хранить в секретах CI, не в `LOADLY.md` / README |

---

## Краткая шпаргалка команд

```bash
npm run build && npm run cap:sync
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk → loadly.io
```

Связанные документы: [DEPLOY.md](DEPLOY.md), [DISTRIBUTION.md](DISTRIBUTION.md).
