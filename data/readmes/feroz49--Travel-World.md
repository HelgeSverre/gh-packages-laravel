# TravelWorld - Travel Management System
TravelWorld is a modern, feature-rich travel management system built with PHP Laravel framework. This system helps travel agencies and tour operators manage their entire business operations from a single platform.


## Team Members
- **Tanmoy Chowdhury Turjo**  
  Role: Team Lead  
  Email: acd776959@gmail.com  
  ID: 20230104124

- **Feroz Alam**  
  Role: Front-End Developer 
  Email: feroz.alam4103@gmail.com  
  ID: 20230104103

- **Nazmus Jahan Roxy**  
  Role: Back-End Developer  
  Email: roxyjahan36@gmail.com
  ID: 20230104101


##  Figma Design Link (Mock)

https://www.figma.com/design/xkR6GmohzjaGd7t03VspWV/TravelWorld---Travel-Planning---Booking-Website--Community-?node-id=0-1&p=f&t=pFyUrGXS6u0PdFlR-0
---

##  Frontend Features

- Tour Package Listings with filtering and search
- Booking System with real-time availability
- User Registration & Authentication
- Online Payment Integration
- Responsive Design for all devices
- Customer Reviews & Ratings
- Interactive Maps for destinations
- Booking Confirmation & Email Notifications
---

## Admin Panel Features

- Tour Package Management (CRUD)
- Customer Management
- Booking Management & Approval System
- Payment Tracking & Invoice Generation
- Dashboard with Analytics & Reports

## Customer Portal

- View Booking History
- Submit Reviews & Ratings
- Profile Management
- Wishlist for favorite packages

##  Technology Stack

| Layer     | Technology                        |
|-----------|------------------------------------|
| Frontend  | React, HTML, CSS        |
| Backend   | Laravel (PHP)                      |
| Database  | MySQL                              |
| Rendering Method  | Server-Side Rendering (SSR)                              |

---

##  Features Roadmap

### Phase 1 (Current)
- Basic tour management
- Customer booking system 
- Authentication

### Phase 2 (Planned)
-Fogot-Password && Reset-Password
-Tour-Guide Details
-Hire The Tour-Guides

-Profile

### Phase 3 (Future)
- Admin Dashboard
- Payment integration
- Deploying The Website





## Setup Instructions
1. **Clone the repository:**  
```bash
git clone https://github.com/feroz49/Travel-World.git
```
2. **Install dependencies:**  
```bash
composer install
npm install
```
3. **Configure environment:**  
```bash
cp .env.example .env
php artisan key:generate
```
4. **Set up the database:**  
```bash
Create a MySQL database and update .env with DB credentials
php artisan migrate --seed
```
5. **Run the application:**  
```bash
php artisan serve
npm run dev
```
6. **Access the app:**  
Open `http://localhost:8000` in your browser
---
