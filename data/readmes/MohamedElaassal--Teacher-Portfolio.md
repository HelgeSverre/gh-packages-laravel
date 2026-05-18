<p align="center">
  <img src="https://github.com/MohamedElaassal/Teacher-Portfolio/blob/master/logo.png" alt="LZz-Learning Logo" width="400">
</p>

# LZz-Learning – Academic Portfolio & E-Learning Platform

**LZz-Learning** is a complete academic portfolio and course management system designed for university professors. Built with **Laravel**, **Filament**, and **Livewire**, and deployed on **DigitalOcean**, this platform streamlines the presentation and management of teaching activities, research publications, student interaction, and more.

## Features

### 1. **Course Management**
- Add and manage courses with descriptions, year/semester info, and associated resources.
- Upload and share PDFs and other materials with students (hosted on DigitalOcean Spaces).

### 2. **Publications Management**
- Showcase academic publications with details like title, content, etc, and publication year.
- Filter and search through publications efficiently.

### 3. **Forum**
- Interactive space for students to ask questions.
- Professors can answer questions and facilitate discussions.

### 4. **Contact Form**
- Integrated contact form allowing site visitors or students to send messages directly.
- Emails are handled via **Brevo (ex-Sendinblue)**.

### 5. **Admin Panel**
- Secure back-office interface built with Filament for managing all content (courses, publications, users, etc.).
- User-friendly CRUD system for seamless updates.

### 6. **Responsive Design**
- Mobile-friendly layout using **Tailwind**.
- Accessible from desktops, tablets, and smartphones.

### 7. **Dark Mode**
- **Filament:** Built-in support
- **User interfaces:** Implemented using Tailwind CSS and Alpine.js

## Technologies Used

- **Backend:** Laravel 12
- **Admin Panel:** Filament 3
- **Frontend:** Tailwind Css
- **Database:** Hosted on Aiven (MySQL)
- **Cloud Storage:** DigitalOcean Spaces for files
- **Email:** Brevo for contact form submissions
- **Database Viewer:** TablePlus
- **Livewire and AlpineJs:** For dynamic and interactive UI components

## Prerequisites

- Laravel 12 
- Filament 3
- Composer
- Node.js & NPM
- MySQL 
- Access to DigitalOcean Spaces and Brevo account

## Installation

To install and run **LZz-Learning** locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/MohamedElaassal/Teacher-Portfolio.git
   cd Teacher-Portfolio
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with:
   - Database credentials
   - DigitalOcean Spaces keys
   - Brevo SMTP credentials

5. Generate app key:
   ```bash
   php artisan key:generate
   ```

6. Run database migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

7. Install JS dependencies and build frontend:
   ```bash
   npm install && npm run dev
   ```

8. Start the server:
   ```bash
   php artisan serve
   ```

Then visit `http://localhost:8000` in your browser.

## Usage

- **Admin Panel:** Visit `/admin` to manage courses, publications, users, and forums.
- **Public Site:** Visit `/` to view the professor's profile, courses, publications, and contact form.

## Contribution

Contributions are welcome! Here's how:

1. Fork the project.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

## License

LZz-Learning is open-source and available under the [MIT License](LICENSE).

## Contact

For inquiries or support, please contact:

- **Email:** mohamedelaassal42@gmail.com
