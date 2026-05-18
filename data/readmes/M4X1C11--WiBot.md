# WiBot 🤖
> Add AI support to any website in minutes — no coding required.

![Laravel](https://img.shields.io/badge/Laravel-13-red?style=flat-square&logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.3-blue?style=flat-square&logo=php)
![Livewire](https://img.shields.io/badge/Livewire-4-pink?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=flat-square&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)

<img width="1249" height="821" alt="WiBot Landing Page" src="https://github.com/user-attachments/assets/e1d43fcc-573d-4cf2-b74a-86fe5d8894dc" />

## What is WiBot?

WiBot is a SaaS platform that lets businesses create custom AI chatbots and embed them on any website using a single JavaScript snippet. Each chatbot is powered by Google Gemini 2.5 Flash and fully customizable via a system prompt — so it behaves exactly the way you want.

**The problem it solves:** Small businesses want AI support on their website but can't afford custom development. WiBot makes it possible in under 5 minutes.

## Screenshots

<img width="1276" height="823" alt="WiBot Dashboard" src="https://github.com/user-attachments/assets/cb3edf7a-04c8-4737-b609-1581f883f390" />
<img width="1276" height="819" alt="WiBot Chatbot" src="https://github.com/user-attachments/assets/0aa6664a-b96c-4dca-82aa-577890cae54b" />

## Features

- 🤖 Create and manage multiple AI chatbots from one dashboard
- 🧠 Powered by Google Gemini 2.5 Flash
- 📋 Custom system prompts — define your bot's personality and knowledge
- 🔗 Embed on any website with 2 lines of code
- 💬 Conversation history per visitor session
- 📊 Dashboard with usage statistics
- 🔒 Token-based authentication per chatbot
- ⚡ Rate limiting on API endpoints

## How It Works

1. **Create a bot** — Sign up, create a chatbot, define its system prompt
2. **Copy the snippet** — Get your unique embed code from the dashboard
3. **Go live** — Paste before `</body>` and your AI chatbot is live instantly

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | Livewire 4, Alpine.js, Tailwind CSS |
| AI | Google Gemini 2.5 Flash API |
| Database | MySQL |
| Build | Vite |

## Installation

```bash
git clone https://github.com/M4X1C11/ai-chat-assistant-laravel.git
cd ai-chat-assistant-laravel

composer install
npm install

cp .env.example .env
php artisan key:generate

# Set DB_* and GEMINI_API_KEY in .env

php artisan migrate
npm run build
php artisan serve
```

## Environment Variables

```env
APP_NAME=WiBot
DB_CONNECTION=mysql
DB_DATABASE=wibot
GEMINI_API_KEY=your_gemini_api_key_here
```

## API

**POST** `/api/chat/{token}`

```json
// Request
{
  "message": "Hello!",
  "session_id": "unique-session-id"
}

// Response
{
  "message": "AI response here"
}
```

## Roadmap

- [ ] Stripe subscription integration
- [ ] Custom widget colors and branding
- [ ] Per-chatbot analytics
- [ ] Live demo deployment

## License

This project is licensed under the AGPL-3.0 License — see [LICENSE](LICENSE) for details.

## Author

Built by [Simo Maksić](https://github.com/M4X1C11) · [LinkedIn](https://www.linkedin.com/in/simo-maksić-3633902b4/)
