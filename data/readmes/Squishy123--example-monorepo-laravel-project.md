# Example Laravel Monorepo Project

Laravel projects are seperated into 2 dirs: apps, packages 

- packages/core: handles shared models, utils
- apps/frontend: a sample app that uses packages (visit /test)
- apps/migration: a sample app that manages database migrations and data migrations

## init
copy all env vars 
```
cd apps/frontend && cp.env.example .env && composer i && npm i && cd .. && \
cd apps/migration && cp.env.example .env && composer i && npm i && cd .. && \
cd packages/core && cp.env.example .env && composer i
```

```
cd apps/migrations && php artisan migrate:fresh
```
