# Команды для создания нового релиза

> **⚠️ ВАЖНО: Обязательно обновите версию в файле `composer.json` перед созданием релиза!**

## Обновление версии и создание тега

```bash
# 1. Коммит изменения версии
git add composer.json && git commit -m "chore: bump version to 1.2.2"

# 2. Создание тега
git tag -a v1.2.2 -m "Release version 1.2.2"

# 3. Пуш изменений и тега
# Если вы на feature ветке - сначала пушим текущую ветку
git push origin HEAD

# Затем переключаемся на main и мержим (если нужно)
# git checkout main
# git merge feature/your-branch

# Или если уже на main:
git push origin main

# Пушим тег
git push origin v1.2.2
```
## Обновление версии и создание тега автоматически
```bash
# Обновление версии в composer.json
"version": {m.m.p},

# Права на выполненье скрипта
chmod +x ./release.sh

# Запуск скрипта с новой версией
./release.sh
```

## Packagist обновится автоматически
После пуша тега, Packagist автоматически обнаружит новую версию через webhook.
