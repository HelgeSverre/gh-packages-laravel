## Docker Instructions

The easiest way to run the package is with Docker

1. Clone the repository:

```bash
git clone https://github.com/jcyepezcoronel/quotes-package.git
cd package
```

2. Run Docker:

```bash
docker-compose up --build
```

3. Visit:
http://localhost:8080/quotes


## Running Tests

```bash
cd package
composer install
./vendor/bin/pest
```

Or inside Docker:
```bash
docker-compose exec app ./vendor/bin/pest
```

## Rate Limiting Strategy

Each request increments a counter in Laravel Cache. If the counter exceeds the limit, a RateLimitExceededException is thrown immediately, no sleeping or blocking. The CLI command catches the exception, waits for the window to reset, and resumes automatically.

Configure in .env:

```env
QUOTES_LIMIT=10
QUOTES_WINDOW=60
```

## Complexity Analysis

Quotes are stored as a flat array sorted by ID. Binary Search works by checking the middle element and eliminating half the array each step:

- Found → return
- Target > mid → search right half
- Target < mid → search left half

O(log n) 1,000 quotes needs 10 comparisons instead of 1,000.

---

## Technical Approach

-Component
Approach

-API Integration 
Laravel HTTP Client 

-Rate Limiting 
cache-backed counter + custom exception 

-Data Storage 
Flat sorted array with is_hydrated flag 

-Search 
-Binary Search O(log n) 

-Frontend 
Vue 3 + TypeScript + Vite 

-Testing 
PestPHP + Mockery 

-Infrastructure 
Docker one-command setup
