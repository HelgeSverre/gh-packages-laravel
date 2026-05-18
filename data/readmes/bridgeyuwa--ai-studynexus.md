
# 3MTT Showcase June Edition
# AI - StudyNexus – Your AI-Powered Academic Advisor
---
## Author
- Torkuma Jonathan Yuwa  
---

## 🎓 Project Summary

I'm excited to present my 3MTT showcase project: **StudyNexus**, an AI-driven web platform that helps students find program-specific requirements across institutions in Nigeria with ease.

---

## 🧩 The Problem

Many prospective students struggle to know the exact admission requirements for their chosen programs, especially as they vary across institutions. Manually checking multiple university websites is slow and frustrating.

---

## 💡 What StudyNexus Does

✅ Lets users select an institution, program, and level of study  
✅ AI returns detailed admission requirements specific to that combination  
✅ Reduces stress and guesswork in the admission process  
✅ Ideal for students, parents, and education consultants  

---

## 🔧 Built With

- Laravel + Livewire for a reactive, backend-driven UI  
- Tailwind CSS for clean design  
- MySQL for structured program/institution data  
- Ollama (LLaMA 3.2) for generating natural-language responses from stored program metadata  

---

## 🧠 How AI Was Used

The AI interprets the selected options (institution, level, program) and returns a human-like explanation of the requirements by analyzing structured data — making results easy to understand for users.

---

## 🌍 Why It Matters

With over 1000 tertiary institutions in Nigeria, getting accurate program info is tough. StudyNexus simplifies the process, enabling better, faster educational decisions.

---

# 🚀 Running StudyNexus Locally

## ✅ Prerequisites

Ensure you have the following installed:

- PHP ≥ 8.2   
- Composer  
- MySQL  
- Laravel Herd (optional, recommended for Mac/Windows) or Apache/Nginx server
- [Ollama](https://ollama.com) with LLaMA 3.2 model installed  

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/bridgeyuwa/ai-studynexus.git
cd ai-studynexus
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database and Ollama details:
```
DB_DATABASE=studynexus
DB_USERNAME=root
DB_PASSWORD=

### 4. Run Migrations and Seed Data
```bash
php artisan migrate --seed
```


### 5. Start the Laravel Server
```bash
php artisan serve
```

 ### 6. Start Frontend Build (Vite)
```bash
npm run dev
```

### 7. Start Ollama with LLaMA 3
```bash
ollama run llama3.2
```

### 8. Access the App
Open your browser and go to:
```
http://localhost:8000
```

---
### Check the `database` folder for the SQL files containing the data for studynexus database (database structure and database data)

- `/database/studynexus_data.sql` and `/database/studynexus_structure.sql`


Let's build tools that empower education. ✊

