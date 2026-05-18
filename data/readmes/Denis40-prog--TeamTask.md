# 🗂 TeamTask (TT)

[![PHP](https://img.shields.io/badge/PHP-8.1%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-10-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![Livewire](https://img.shields.io/badge/Livewire-3-4E56A6?logo=laravel&logoColor=white)](https://livewire.laravel.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

**TeamTask** est une application de gestion de projets et d'équipes développée avec **Laravel** et **Livewire**, permettant aux utilisateurs de collaborer efficacement autour de tâches, commentaires et projets partagés.

---

## 🚀 Fonctionnalités actuelles

### 📌 Gestion des projets
- Dashboard affichant les équipes dont fait parti l'utilisateur.
- Affichage des projets d’une équipe.
- Description et informations détaillées sur chaque projet.
- Onglet "Projets" et "Équipes" dépliables.

### ✅ Gestion des tâches
- Création de tâches avec :
  - Titre
  - Description
  - Priorité (basse, moyenne, élevée)
  - Date d’échéance
  - Assignation à un ou plusieurs membres de l’équipe
- Modification des tâches (titre, description, statut)
- Affichage des informations clés (statut, priorité, date de création, date d’échéance, assignés)
- **Filtrage et tri :**
  - Par statut, membre assigné, date d’échéance
  - Tri par date de création ou priorité

### 💬 Gestion des commentaires
- Ajout de commentaires sur un projet
- Affichage des commentaires récents avec auteur et date

### 🌤️ Météo des émotions
- Suivi du bien-être de l'équipe via des questionnaires
- Visualisation de l'état émotionnel des membres
- Historique des réponses pour analyse des tendances

### 🎨 Interface
- UI responsive avec **Tailwind CSS**
- Composants dynamiques Livewire pour une interaction fluide
- Affichage clair des priorités et statuts par couleurs

---

## 🛠 Technologies utilisées

- **Backend :** [Laravel 12](https://laravel.com/) + [PHP 8+](https://www.php.net/)
- **Frontend :** [Livewire](https://livewire.laravel.com/) + [Blade](https://laravel.com/docs/blade) + [Tailwind CSS](https://tailwindcss.com/)
- **Base de données :** [MySQL](https://www.mysql.com/)
- **Authentification :** [Laravel Breeze](https://laravel.com/docs/starter-kits#laravel-breeze) / [Sanctum](https://laravel.com/docs/sanctum)
- **Environnement :** Sail (WSL)

---

## 📂 Structure du code

- `database/migrations/` → création des tables de la base de données.
- `app/Livewire/` → Composant Livewire pour la gestion des tâches et commentaires.
- `resources/views/livewire/` → Vue principale avec gestion affichage/édition/création.
- Routes Laravel dans `web.php`.

---

## ⚙️ Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/Denis40-prog/TeamTask.git
cd TeamTask
```

---

### 2. Installer les dépendances
```bash
composer install
npm install
```

---

### 3. Configurer l’environnement
```bash
cp .env.example .env
php artisan key:generate
```
Configurer la connexion à la base de données dans .env.

---

### 4. Lancer le serveur
```bash
sail up
sail npm run dev
```

---

### 5. Lancer les migrations et seeders
```bash
sail artisan migrate --seed
```

---

### 📅 À venir
## Sidebar dynamique :
- Réponses imbriquées aux commentaires (système de sous-commentaires avec affichage hiérarchique).
- Onglet “Activité récente” : suivi chronologique des actions (création/modification de tâches, commentaires, etc.).
- Refonte profil utilisateur : avatar, bio, préférences, meilleure UX pour la gestion du compte.

## Gestion avancée des équipes :
- Invitations par lien
- Meilleure gestion des droits par rôle

## Système de notifications :
- Internes (UI)
- Base technique pour notifications email

## Mise en concurrence hebdomadaire
- Challenge sous forme de mission hebdomadaire 

---

### 👤 Auteur
Projet développé par Denis Chevanne dans le cadre du projet TeamTask (TT).

