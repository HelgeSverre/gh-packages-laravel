# Playlist Tracker

Playlist Tracker is a web application that helps users keep track of YouTube videos and playlists progress. The application allows users to categorize videos and playlists, add tags, filter by tags, and rate them based on difficulty and personal preferences.

![Playlist Tracker Screenshot](/preview.png?raw=true "Playlist Tracker Screenshot")

## Features

- Add custom tags to playlists and videos
- Track progress with a progress bar for each category
- Rate each video and playlist
- Set difficulty levels for videos and playlists
- Filter videos by tags
- Mark videos or playlists as in progress or completed
- Change the order of videos and playlists

## Technologies

- PHP
- Laravel
- MySQL
- Livewire
- TailwindCSS

## Installation

1. Clone the repository

2. Change into the project directory:
`cd playlist-tracker`

3. Install the dependencies:
`composer install`
`npm install`


4. Copy the `.env.example` file to `.env`: 
`cp .env.example .env`

5. Update the `.env` file with your database credentials and YOUTUBE_API_KEY.

6. Generate the application key:
`php artisan key:generate`

7. Run the migrations:
`php artisan migrate`

8. Seed the database

9. Start the local development server:
`php artisan serve`
Now, you can visit the application at `http://127.0.0.1:8000`.

10. Add cron job to run the scheduler every minute:
`* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1`
