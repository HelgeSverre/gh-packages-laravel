# Khodnevis – AI-powered Note-taking Assistant

Khodnevis is an intelligent Persian-language web app that converts audio into structured summaries using Whisper for transcription and GPT for content generation.

---

## Project Overview

Taking structured notes from audio content can be time-consuming. Khodnevis simplifies this by allowing users to upload audio files and receive clean, categorized pamphlets.

---

## Technologies Used

[![Laravel](https://img.shields.io/badge/-Laravel-%23FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Livewire](https://img.shields.io/badge/-Livewire-%2322C55E?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel-livewire.com)
[![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-%2306B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/-OpenAI-%23000000?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![SQLite](https://img.shields.io/badge/-SQLite-%230073a6?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)

---

## Features

- Upload audio files (MP3, WAV, AAC, OGG, FLAC)  
- Generate structured pamphlets with introduction, body, and conclusion  
- Whisper transcription + GPT content generation  
- History panel to manage previous pamphlets  
- Custom prompt input for personalized summaries  

---

## Project Status

In develope for better performance.

---

## Screenshots

All screenshots are in the [`screenshots`]([./screenshots](https://github.com/fatemeh-shahrabi/Khodnevis/blob/main/Screenshot) folder:

| ![form](./Screenshot/form.png) | ![pamphlet](./Screenshot/pamphlet.png) |
|----------------------------------|------------------------------------------|

---

## Getting Started

Follow these steps to run the project locally:

```bash
# 1. Clone the repository
git clone https://github.com/fatemeh-shahrabi/khodnevis.git
cd khodnevis

# 2. Install PHP dependencies
composer install

# 3. Install frontend assets
npm install && npm run build

# 4. Copy .env config
cp .env.example .env

# 5. Generate app key
php artisan key:generate

# 6. Create SQLite DB file
touch database/database.sqlite

# 7. Update your .env file:
# DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database/database.sqlite

# 8. Run migrations
php artisan migrate

# 9. Link storage
php artisan storage:link

# 10. Start dev server
php artisan serve
```


Environment Variables

Make sure to add your OpenAI API key in the .env file

```env
OPENAI_API_KEY="your_openai_api_key_here"
```

## Project Structure

```swift
app/
├── Livewire/Pamphlet/SinglePagePamphlet.php
├── Service/MetisClient.php
├── Service/TranscriptionService.php
├── Models/Pamphlet.php

resources/views/
├── welcome.blade.php
└── livewire/pamphlet/single-page-pamphlet.blade.php
```
