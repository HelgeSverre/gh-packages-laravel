# 🧠 ollama-notes-laravel-package (ai-notes)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nahid/laravel-ai-notes.svg?style=flat-square)](https://packagist.org/packages/nahid-hasan/ai-notes)
[![Total Downloads](https://img.shields.io/packagist/dt/nahid/laravel-ai-notes.svg?style=flat-square)](https://packagist.org/packages/nahid-hasan/ai-notes)
[![License](https://img.shields.io/packagist/l/nahid/laravel-ai-notes.svg?style=flat-square)](LICENSE)
[![PHP Version](https://img.shields.io/packagist/php-v/nahid/laravel-ai-notes.svg?style=flat-square)](composer.json)

**Turn your Laravel app into an AI-powered memory system.**

Record a voice note or write text. Search it later using natural language — not keywords.
No OpenAI account needed. Runs 100% locally and free with Ollama + Whisper.

```php
// Store a voice note
AINote::fromAudio($request->file('audio'));

// Store a text note
AINote::fromText("Met with client Sarah about renewing the contract.");

// Search semantically — finds related notes even with different wording
AINote::search("contract renewal discussion");

// Ask a question across all your notes
AINote::ask("What did I promise the client?");
```

---

## Features

- 🎙️ **Voice notes** — upload audio, Whisper transcribes it automatically
- ✍️ **Text notes** — store any text, summarized and embedded instantly
- 🔍 **Semantic search** — find notes by meaning, not just keywords (pgvector)
- 🤖 **Ask questions** — RAG-powered Q&A across your entire note history
- ⚡ **Queue-first** — all AI processing runs async via Laravel queues
- 🔌 **Swappable drivers** — Ollama (free/local) or OpenAI (paid)
- 🐳 **Docker included** — full docker-compose setup out of the box
- 🧪 **Fake provider** — test without any AI services running

---

## Requirements

| Requirement   | Version  |
|--------------|----------|
| PHP          | ^8.2     |
| Laravel      | ^11.0    |
| PostgreSQL   | ^14 + pgvector extension |
| Redis        | Any      |

> **For the free local AI stack** (recommended): Docker is required to run Ollama and Whisper containers.  
> **For OpenAI**: just an API key, no Docker needed for AI services.

---

## Installation

### 1. Install the package

```bash
composer require nahid-hasan/ai-notes
```

### 2. Run the install command

```bash
php artisan ai-notes:install
```

This publishes the config file and migrations.

### 3. Run migrations

```bash
php artisan migrate
```

> This creates the `ai_notes` table and enables the `pgvector` extension automatically.

---

## Setup: Free Local Stack (Recommended)

This uses **Ollama** (summarization + embeddings) and **Whisper** (transcription) — both running in Docker, zero cost, zero API keys.

### Step 1 — Add Docker services

Copy this into your `docker-compose.yml`:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ai_notes_ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - your_network

  whisper:
    image: your-whisper-image  # see full docker setup in docs
    container_name: ai_notes_whisper
    ports:
      - "9000:9000"
    networks:
      - your_network

volumes:
  ollama_data:
```

> For the complete docker-compose.yml with Whisper Dockerfile and Flask server, see [Docker Setup](#docker-setup) below.

### Step 2 — Pull the AI models

```bash
# Pull once — these stay cached in the ollama_data volume
docker exec ai_notes_ollama ollama pull llama3.2
docker exec ai_notes_ollama ollama pull nomic-embed-text
```

> First pull is ~2-4GB. After that, restarts are instant.

### Step 3 — Configure your `.env`

```dotenv
AI_DRIVER=ollama

OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_CHAT_MODEL=llama3.2
OLLAMA_EMBED_MODEL=nomic-embed-text

WHISPER_BASE_URL=http://whisper:9000

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_password

QUEUE_CONNECTION=redis
REDIS_HOST=redis
```

### Step 4 — Start the queue worker

```bash
php artisan queue:work
```

That's it. You're running fully local AI.

---

## Setup: OpenAI (Paid Alternative)

If you prefer OpenAI and already have an API key:

```dotenv
AI_DRIVER=openai
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
```

No Ollama or Whisper needed. Everything else works identically.

> **Note:** When switching from Ollama (768 dims) to OpenAI (1536 dims), you need to re-run migrations with the correct dimension. Set `AI_NOTES_VECTOR_DIM=1536` in `.env` before migrating.

---

## Usage

### Storing Notes

**From audio (voice note):**
```php
use AINote;

// In a controller
public function store(Request $request)
{
    $request->validate([
        'audio' => 'required|file|mimes:wav,mp3,mp4,webm|max:51200'
    ]);

    $note = AINote::fromAudio(
        $request->file('audio'),
        userId: auth()->id()   // optional — omit for single-user apps
    );

    // Note is queued for processing. Returns immediately.
    return response()->json([
        'note_id' => $note->id,
        'status'  => $note->status,  // "pending"
    ], 202);
}
```

**From text:**
```php
$note = AINote::fromText(
    "Had a call with John. He wants the proposal by Friday.",
    userId: auth()->id(),
    title: "John call"  // optional
);
```

---

### Checking Processing Status

AI processing is async. Poll the status or use a webhook/event:

```php
use Nahid\AINotesPackage\Models\AINote;

$note = AINote::find($noteId);

echo $note->status;
// "pending"    → queued, not started
// "processing" → AI is working on it
// "done"       → transcription, summary, and embedding ready
// "failed"     → something went wrong, check logs
```

---

### Searching Notes

```php
// Basic search
$results = AINote::search("payment discussion");

// Limit results
$results = AINote::search("contract renewal", 3);

// Scoped to a user
$results = AINote::search("invoice delay", 5, auth()->id());

// Each result has a `distance` score — lower = more relevant (0.0 to 1.0)
foreach ($results as $note) {
    echo $note->summary;
    echo $note->distance;  // e.g. 0.31 = very relevant
}
```

**How distance scores work:**

| Distance  | Meaning                        |
|-----------|-------------------------------|
| 0.0 – 0.3 | Highly relevant                |
| 0.3 – 0.5 | Related / probably useful      |
| 0.5 – 0.7 | Loosely related                |
| 0.7 – 1.0 | Not really related             |

---

### Asking Questions (RAG)

```php
// Ask a question — searches relevant notes and generates an answer
$answer = AINote::ask("What did I say about the Q4 budget?");
echo $answer;

// Scoped to a user
$answer = AINote::ask("What promises did I make to clients?", userId: auth()->id());

// Control how many notes are used as context (default: 3)
$answer = AINote::ask("Summarize my week", contextLimit: 5, userId: auth()->id());
```

---

### Working with the Model Directly

```php
use Nahid\AINotesPackage\Models\AINote;

// All done notes
AINote::done()->get();

// All pending notes
AINote::pending()->get();

// Notes for a specific user
AINote::where('user_id', $userId)->done()->latest()->get();

// Retry a failed note
$note = AINote::find($id);
$note->update(['status' => 'pending']);
\Nahid\AINotesPackage\Jobs\ProcessNote::dispatch($note);
```

---

## Complete API Reference

### `AINote::fromAudio(UploadedFile $file, ?int $userId = null): AINote`
Upload an audio file. Queues transcription → summarization → embedding.
Returns the note immediately with `status = "pending"`.

### `AINote::fromText(string $text, ?int $userId = null, ?string $title = null): AINote`
Store a text note. Queues summarization → embedding.
Returns the note immediately with `status = "pending"`.

### `AINote::search(string $query, int $limit = 5, ?int $userId = null): Collection`
Semantic search across all `done` notes. Returns an Eloquent Collection sorted by relevance. Each result includes a `distance` attribute.

### `AINote::ask(string $question, int $contextLimit = 3, ?int $userId = null): string`
RAG-powered question answering. Finds the most relevant notes, builds context, and asks the AI to answer your question based on them. Returns a plain string answer.

---

## Configuration

Publish and edit `config/ai-notes.php`:

```php
return [
    // 'ollama' (free/local) or 'openai' (paid)
    'driver' => env('AI_DRIVER', 'ollama'),

    // Set false to process synchronously (useful in tests)
    'queue' => env('AI_NOTES_QUEUE', true),

    'ollama' => [
        'base_url'    => env('OLLAMA_BASE_URL', 'http://localhost:11434'),
        'chat_model'  => env('OLLAMA_CHAT_MODEL', 'llama3.2'),
        'embed_model' => env('OLLAMA_EMBED_MODEL', 'nomic-embed-text'),
    ],

    'whisper' => [
        'base_url' => env('WHISPER_BASE_URL', 'http://localhost:9000'),
    ],

    'openai' => [
        'api_key'     => env('OPENAI_API_KEY'),
        'chat_model'  => env('OPENAI_CHAT_MODEL', 'gpt-4o-mini'),
        'embed_model' => env('OPENAI_EMBED_MODEL', 'text-embedding-3-small'),
    ],

    'database' => [
        // 768 for Ollama nomic-embed-text
        // 1536 for OpenAI text-embedding-3-small
        'vector_dimension' => env('AI_NOTES_VECTOR_DIM', 768),
    ],
];
```

---

## Docker Setup

Full `docker-compose.yml` for a new project using this package:

```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    volumes:
      - .:/var/www
    networks:
      - app_network
    depends_on:
      - postgres
      - redis
      - ollama

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - .:/var/www
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    networks:
      - app_network

  postgres:
    image: pgvector/pgvector:pg16   # <-- important: pgvector image, not plain postgres
    environment:
      POSTGRES_DB: your_db
      POSTGRES_USER: laravel
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network

  redis:
    image: redis:alpine
    networks:
      - app_network

  queue:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    command: php artisan queue:work --sleep=3 --tries=3
    volumes:
      - .:/var/www
    networks:
      - app_network
    depends_on:
      - postgres
      - redis
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - app_network

  whisper:
    build:
      context: .
      dockerfile: docker/whisper/Dockerfile
    ports:
      - "9000:9000"
    volumes:
      - whisper_models:/root/.cache/whisper
    networks:
      - app_network

volumes:
  postgres_data:
  ollama_data:
  whisper_models:

networks:
  app_network:
    driver: bridge
```

**`docker/whisper/Dockerfile`:**
```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean
RUN pip install --no-cache-dir openai-whisper flask werkzeug
COPY docker/whisper/server.py /app/server.py
WORKDIR /app
EXPOSE 9000
CMD ["python", "server.py"]
```

**`docker/whisper/server.py`:**
```python
import whisper, os, tempfile
from flask import Flask, request, jsonify

app = Flask(__name__)
model = whisper.load_model("base")  # tiny/base/small/medium/large

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    f = request.files["audio"]
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        f.save(tmp.name)
        result = model.transcribe(tmp.name)
        os.unlink(tmp.name)
    return jsonify({"text": result["text"].strip()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
```

---

## Testing

The package ships with a `FakeAIProvider` so your tests never hit real AI services:

```php
use Nahid\AINotesPackage\Contracts\AIProvider;
use Nahid\AINotesPackage\Tests\Fakes\FakeAIProvider;

// In your TestCase setUp or individual tests:
app()->bind(AIProvider::class, fn() => FakeAIProvider::make());
config(['ai-notes.queue' => false]); // process synchronously

// Now AINote works without Ollama or Whisper running
$note = AINote::fromText("Test note content");
expect($note->status)->toBe('done');
```

**Customise fake responses:**
```php
$fake = FakeAIProvider::make()
    ->withTranscription("Custom transcription text")
    ->withSummary("Custom summary");

app()->bind(AIProvider::class, fn() => $fake);
```

---

## Custom AI Driver

Implement the `AIProvider` contract to use any AI provider:

```php
use Nahid\AINotesPackage\Contracts\AIProvider;

class MistralProvider implements AIProvider
{
    public function transcribe(string $audioPath): string
    {
        // your transcription logic
    }

    public function summarize(string $text): string
    {
        // your summarization logic
    }

    public function embed(string $text): array
    {
        // your embedding logic — must return float[]
    }
}
```

Register it in a service provider:
```php
use Nahid\AINotesPackage\Contracts\AIProvider;

$this->app->bind(AIProvider::class, fn() => new MistralProvider());
```

---

## Troubleshooting

**`SQLSTATE: type "vector" does not exist`**  
You're using plain PostgreSQL without pgvector. Use the `pgvector/pgvector:pg16` Docker image instead of `postgres:16`.

**Notes stuck on `pending` status**  
Your queue worker isn't running. Start it:
```bash
php artisan queue:work
# or in Docker:
docker exec -it your_queue_container php artisan queue:work
```

**Ollama returns empty embeddings**  
The model isn't pulled yet:
```bash
docker exec ai_notes_ollama ollama pull nomic-embed-text
```

**Whisper is slow on first request**  
Normal — it loads the model into memory on first call (~10-15 seconds). Subsequent calls are fast.

**`distance` is always high (>0.8) for all results**  
Your notes were embedded with a different model than your search query. If you switched from Ollama to OpenAI (or vice versa), re-process your notes:
```php
// Reset all notes to re-embed them
Nahid\AINotesPackage\Models\AINote::query()->update(['status' => 'pending', 'embedding' => null]);
// Then reprocess each one via the job
```

**Notes have `status = failed`**  
Check `storage/logs/laravel.log` for the error. Common causes: Ollama not running, Whisper unreachable, or audio file format not supported by Whisper.

---

## Roadmap

- [ ] Livewire/Vue UI component
- [ ] Auto-tagging via AI
- [ ] Vector DB drivers (Pinecone, Weaviate, Qdrant)
- [ ] Realtime recording via browser MediaRecorder API
- [ ] Team/multi-tenant support
- [ ] Note export (PDF, Markdown)
- [ ] Scheduled note digests ("summarize my week")

---

## Contributing

Contributions are welcome. Please:
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for your changes
4. Submit a PR against `main`

---

## License

The MIT License. See [LICENSE](LICENSE) for details.
