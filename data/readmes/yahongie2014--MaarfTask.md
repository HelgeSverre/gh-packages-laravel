# 🚀 YouTube Course Scraper

A robust, full-stack application built with **Laravel 12, Livewire, and Tailwind CSS** that automatically discovers, fetches, and organizes high-quality educational courses from YouTube based on user-defined categories.

---

## 🌟 Key Features

### 1. The Data Pipeline
*   **Intelligent Input**: Accepts multiple categories via a textarea (one per line).
*   **AI Title Generation**: A dedicated `AIService` simulates the generation of highly-specific, granular search queries for each category (e.g., "Advanced Marketing Strategies 2024").
*   **Granular YouTube Search**: Uses the YouTube Data API to query for actual educational playlists matching the AI-generated titles.
*   **Deduplication Engine**: Ensures database integrity before saving by checking unique `youtube_id`s. No duplicate courses are ever inserted.

### 2. Premium User Interface
*   **State-of-the-Art Aesthetic**: Features a high-end "Glassmorphism" design structure with subtle glows, custom hover animations, and vibrant active states.
*   **Real-time Reactivity**: Powered entirely by Livewire 4—allowing fetching, filtering, and searching without a single page reload.
*   **Live Search**: A perfectly debounced `(300ms)` search bar that queries the database instantly.
*   **Elite Pagination**: A completely custom-built, circular pagination UI that handles deep data sets (`1 2 3 ... 10`) gracefully.

### 3. Full Localization (i18n & RTL)
*   **Multi-Language (EN/AR)**: Complete translation files for English and Arabic.
*   **Dynamic RTL Engine**: The entire layout, including standard HTML flow and complex components like pagination arrows, automatically flips directions perfectly when Arabic is selected.
*   **Premium Typography**: Implements `Cairo` for elegant Arabic text and `Roboto` for crisp English text.

### 4. Robust Architecture
*   **Repository Design Pattern**: Decouples database logic using `CategoryRepository` and `CourseRepository`, making the application highly testable and scalable.
*   **N+1 Optimization**: Utilizes Eloquent eager loading (`with('category')` and `withCount('courses')`) to ensure the dashboard runs lightning-fast perfectly, regardless of the data size.
*   **Database Indexing**: The `title` column features a database index, guaranteeing the Live Search maintains its speed even as the course table grows.

---

## ⚙️ Installation & Setup

**Prerequisites:** PHP 8.2+, Composer, Node.js + NPM, MySQL.

1.  **Install PHP Dependencies**
    ```bash
    composer install
    ```
2.  **Install Node Dependencies**
    ```bash
    npm install
    npm run build
    ```
3.  **Environment Setup**
    *   Duplicate `.env.example` to `.env`.
    *   Set your database credentials (`DB_CONNECTION=mysql`, `DB_DATABASE=task`, etc.).
    *   Optional: Add a valid `YOUTUBE_API_KEY` to fetch live data (fallback mock-data runs automatically if empty).
4.  **Database Migration**
    ```bash
    php artisan migrate
    ```
5.  **Run Application**
    ```bash
    php artisan serve
    ```

---

## 🛠 Usage Walkthrough

1.  **Open the Dashboard**: Navigate to `http://localhost:8000`. Use the top-right globe button to select your preferred language/layout (EN/AR).
2.  **Enter Categories**: In the text area, input topics you want to find courses for (e.g., *Programming, Data Science, Graphic Design*).
3.  **Start Scraping**: Click the "Start Fetching / ابدأ الجمع" button.
4.  **Watch it Work**: The system will automatically generate AI titles beneath the hood, query YouTube, deduplicate the results, and save them to your MySQL database.
5.  **Explore**: Use the category chips to filter the grid, the search bar to locate specific titles quickly, and the pagination to browse the library.

---

## 🔌 API Integration Documentation

The application also exposes secure formatting rules via Laravel Resources. If you need to access the data externally, an API is available.

*   An official **Postman Collection** is included in the project root: `youtube_course_scraper_postman.json`.
*   You can import this directly into Postman to test the `/api/courses` and `/api/categories` endpoints.
