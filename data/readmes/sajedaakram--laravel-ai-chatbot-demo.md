<h1 align="center">LaraChatPilot</h1>

<p align="center">
  <strong>AI Chatbot Widget for Any Laravel Application</strong><br>
  A production-ready, drop-in chatbot that adapts to any industry with one config change.
</p>

<p align="center">
  <img src="docs/screenshots/01-hero.png" alt="LaraChatPilot — AI Chatbot for Any Business" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 13">
  <img src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/PHP-8.3+-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.3+">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/OpenAI-API-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-hire-me">Hire Me</a>
</p>

---

## 💡 What Is This?

**LaraChatPilot** is a complete, portfolio-grade AI chatbot widget that you can drop into any Laravel application. It showcases how to integrate modern AI (OpenAI, Groq, Ollama) into Laravel apps with a clean, provider-agnostic architecture.

Built as a proof of concept for my Upwork service: **"Add AI Chatbot / GPT-4 Features to Your Existing Laravel App"**.

### The Killer Feature: Industry Presets

Change **one environment variable**, and the chatbot transforms into a completely different assistant:

```env
CHATBOT_PRESET=healthcare    # Medical assistant with safety guardrails
CHATBOT_PRESET=ecommerce     # Shopping assistant for online stores
CHATBOT_PRESET=realestate    # Property assistant for listings
CHATBOT_PRESET=general       # Versatile assistant for any business
```

Each preset changes the personality, welcome message, colors, icon, and system prompt — no code changes required.

---

## ✨ Features

### Core Chat Features
- 🚀 **Real-time SSE Streaming** — AI responses appear word-by-word as they're generated
- 🌍 **Bilingual Support** — English & Arabic with automatic RTL layout detection
- 💬 **Session-Based Conversations** — Persistent history per browser session
- 📱 **Mobile Responsive** — Floating button + fullscreen chat on small screens
- 📝 **Markdown Rendering** — Bot responses support **bold**, *italic*, `code`, and line breaks

### Industry Presets
- 🎨 **4 Built-in Presets** — General, Healthcare, E-commerce, Real Estate
- 🎯 **Live Preset Switching** — Users can switch industries on the fly via the UI
- 🔧 **Customizable** — Add your own presets in `config/chatbot.php`

### Provider Agnostic
- 🔌 **OpenAI Compatible API** — Works with OpenAI, Groq, Ollama, LocalAI, or any compatible endpoint
- 🔄 **Swap Providers in 3 Lines** — Just change `OPENAI_BASE_URL` and `OPENAI_MODEL` in `.env`
- 💰 **Cost Flexibility** — Use free Groq for demos, OpenAI for production, Ollama for self-hosted

### Admin Dashboard
- 📊 **Analytics** — Total conversations, messages, active sessions, daily trends
- 💬 **Conversation Viewer** — Browse all chat transcripts with token usage
- 📈 **Messages Per Day Chart** — Visual usage trends
- 🔐 **HTTP Basic Auth** — Password-protected admin panel

### Security & Production Readiness
- ✅ Session-scoped conversation access (prevents cross-session data leakage)
- ✅ Rate limiting on API endpoints (60/min general, 20/min for AI calls)
- ✅ CSRF protection on all mutations
- ✅ Input validation on all user messages
- ✅ Admin panel behind HTTP Basic Auth

---

## 🎬 Demo

### Live Demo
🌐 **Coming soon**

### Screenshots

#### 💬 Real-Time AI Chat Widget
Beautiful, responsive chat widget with SSE streaming and bilingual Arabic/English support.
<p align="center">
  <img src="docs/screenshots/02-chat-widget.png" alt="Chat Widget with bilingual support" width="100%">
</p>

#### 🎨 Industry Presets — The Killer Feature
Change **one config line** and the chatbot transforms for any industry.
<p align="center">
  <img src="docs/screenshots/03-presets.png" alt="Industry Presets" width="100%">
</p>

#### 📊 Built-in Admin Dashboard
Monitor conversations, track usage, and review AI responses — all in one place.
<p align="center">
  <img src="docs/screenshots/04-admin-dashboard.png" alt="Admin Dashboard" width="100%">
</p>

#### 🛠 Modern Tech Stack
Production-ready architecture with clean code and best practices.
<p align="center">
  <img src="docs/screenshots/05-tech-stack.png" alt="Tech Stack" width="100%">
</p>

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+
- An API key from [OpenAI](https://platform.openai.com), [Groq](https://console.groq.com) (free), or a local Ollama installation

### Installation

```bash
# Clone the repo
git clone https://github.com/sajedaakram/laravel-ai-chatbot-demo.git
cd laravel-ai-chatbot-demo

# Install dependencies
composer install
npm install

# Set up environment
cp .env.example .env
php artisan key:generate

# Configure your AI provider in .env (see below)

# Run migrations
php artisan migrate

# Build frontend assets
npm run build

# Start the server
php artisan serve
```

Open `http://127.0.0.1:8000` in your browser.

### Configure Your AI Provider

Edit `.env`:

#### Option 1: OpenAI (Paid)
```env
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

#### Option 2: Groq (Free Tier) ⭐ Recommended for Demos
```env
OPENAI_API_KEY=gsk_your-groq-key
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

#### Option 3: Ollama (Self-Hosted, 100% Free)
```env
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3
```

### Configure the Chatbot Preset

```env
CHATBOT_PRESET=general       # or: healthcare, ecommerce, realestate
CHATBOT_MAX_TOKENS=1024
CHATBOT_TEMPERATURE=0.7
CHATBOT_RATE_LIMIT=20
```

### Configure Admin Panel

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

Access the admin panel at `http://127.0.0.1:8000/admin`.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                         │
│  ┌──────────────────────────────────────────────┐   │
│  │   Vue 3 Chat Widget (ChatWidget.vue)         │   │
│  │   - Floating button → Chat window            │   │
│  │   - Consumes SSE via fetch + ReadableStream  │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │ POST /api/chat/message
                     │ Accept: text/event-stream
                     ▼
┌─────────────────────────────────────────────────────┐
│                 Laravel 13                          │
│  ┌──────────────────────────────────────────────┐   │
│  │  ChatController                              │   │
│  │    └─ streamResponse() → SSE                 │   │
│  └──────────────────────────────────────────────┘   │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐   │
│  │  ChatService (business logic)               │   │
│  │    ├─ getOrCreateConversation()             │   │
│  │    ├─ streamMessage() [Generator]           │   │
│  │    └─ Session-scoped access control         │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐   │
│  │  AIService (provider abstraction)           │   │
│  │    ├─ streamChat() [Generator]              │   │
│  │    ├─ detectLanguage() [AR/EN]              │   │
│  │    └─ getSystemPrompt() [from preset]       │   │
│  └──────────────────┬──────────────────────────┘   │
└─────────────────────┼───────────────────────────────┘
                      │ OpenAI-compatible API
                      ▼
        ┌─────────────────────────────┐
        │  OpenAI / Groq / Ollama     │
        │  (any compatible endpoint)   │
        └─────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `config/chatbot.php` | Industry presets, system prompts, model config |
| `app/Services/AIService.php` | Provider-agnostic AI abstraction |
| `app/Services/ChatService.php` | Business logic, session management |
| `app/Http/Controllers/ChatController.php` | API endpoints + SSE streaming |
| `resources/js/components/ChatWidget.vue` | Main Vue chat widget orchestrator |
| `resources/js/components/ChatWindow.vue` | Chat window UI |
| `resources/js/components/PresetSwitcher.vue` | Live preset switcher bar |
| `app/Models/Conversation.php` | Conversation model with session scoping |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Laravel 13, PHP 8.3+ |
| **Frontend** | Vue.js 3 (Composition API), Tailwind CSS 4 |
| **Database** | SQLite (default) / MySQL / PostgreSQL |
| **AI** | OpenAI-compatible API (OpenAI / Groq / Ollama) |
| **Streaming** | Server-Sent Events (SSE) |
| **Build Tool** | Vite |
| **Package** | `openai-php/laravel` |

---

## 📁 Project Structure

```
laravel-ai-chatbot-demo/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/DashboardController.php
│   │   │   └── ChatController.php
│   │   └── Middleware/AdminBasicAuth.php
│   ├── Models/
│   │   ├── Conversation.php
│   │   └── Message.php
│   └── Services/
│       ├── AIService.php
│       └── ChatService.php
├── config/
│   ├── chatbot.php              ← Preset system
│   └── openai.php
├── database/migrations/
├── resources/
│   ├── js/components/
│   │   ├── ChatWidget.vue       ← Main widget
│   │   ├── ChatWindow.vue
│   │   ├── ChatMessage.vue
│   │   ├── ChatInput.vue
│   │   ├── ChatToggleButton.vue
│   │   ├── PresetSwitcher.vue
│   │   └── LanguageToggle.vue
│   ├── css/app.css
│   └── views/
│       ├── app.blade.php        ← Landing page
│       └── admin/
└── routes/
    ├── api.php
    └── web.php
```

---

## 🔒 Security

This project implements several security best practices:

- **Session-scoped conversation access** — Users can only access their own conversations
- **CSRF protection** on all state-changing requests
- **Rate limiting** to prevent abuse (configurable)
- **HTTP Basic Auth** on the admin panel
- **Input validation** on all user-submitted data
- **`.env` secrets** never committed to version control

Before deploying to production:
```env
APP_ENV=production
APP_DEBUG=false
SESSION_ENCRYPT=true
```

And run `php artisan key:generate` on the production server.

---

## 👩‍💻 Hire Me

I'm **Sajeda Akram** — a senior full-stack developer with a strong background in healthcare IT.

### Why Hire Me?
- 🏆 **100% Job Success** on Upwork
- 🎯 **70+ completed projects**
- ⭐ **5.0 average rating**
- 🏥 **Healthcare IT expert**

### Services I Offer
- Add AI chatbot / GPT-4 features to your existing Laravel app
- Full Laravel application development
- Vue.js frontend development
- Healthcare IT system integration
- API development & integration

### Get In Touch
👉 **[Hire Me on Upwork](https://www.upwork.com/freelancers/sajedaakram?mp_source=share)**

---

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

<p align="center">
  Built with ❤️ by <a href="https://www.upwork.com/freelancers/sajedaakram?mp_source=share">Sajeda Akram</a><br>
  <sub>⭐ Star this repo if you found it useful!</sub>
</p>
