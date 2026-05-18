# DevJobs

DevJobs is a job board platform built with Laravel that allows companies to publish job opportunities and developers to browse available positions.

This project was originally developed as part of a learning course and later extended with additional improvements and features.

## Features

- User authentication
- Job posting system
- Job listing and filtering
- Company/job details
- Application management
- Upload your resume
- Notifications
- Listing candidates

## Tech Stack

- Laravel
- PHP
- MySQL
- Blade
- TailwindCSS
- Livewire
- TinyMCE

## Purpose

This project is part of my portfolio to showcase my experience building full-stack applications with Laravel.

## Installation

```bash
git clone https://github.com/isabel5200/DevJobs
cd devjobs
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run dev
php artisan serve
