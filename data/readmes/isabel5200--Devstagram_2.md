# Devstagram

Devstagram is an Instagram-inspired social media application built with Laravel.  
Users can create accounts, upload images, interact with posts, and manage their profiles.

This project was originally developed as part of a learning course, but I extended it with additional functionality and improvements.

## Features

- User authentication and registration
- Image posting
- Likes on posts
- User profiles
- Post feed
- Image storage and management
- Search users

## Tech Stack

- Laravel
- PHP
- MySQL
- Blade
- TailwindCSS
- Livewire

## Purpose

This project is part of my backend portfolio to demonstrate my experience working with Laravel and building full-stack web applications.

## Installation

```bash
git clone https://github.com/isabel5200/Devstagram_2.git
cd devstagram
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run dev
php artisan serve
