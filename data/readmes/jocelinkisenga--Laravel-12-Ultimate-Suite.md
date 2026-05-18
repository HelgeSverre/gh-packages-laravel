# 🚀 Laravel 12 Ultimate Suite for Sublime Text 4

[![Laravel Version](https://github.com/jocelinkisenga/Laravel-12-Ultimate-Suite-sublime-tex-4/blob/main/laravel.png)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-8.4-blue.svg)](https://php.net)
[![Editor](https://img.shields.io/badge/Sublime%20Text-4-orange.svg)](https://sublimetext.com)

**Laravel 12 Ultimate Suite** est l'extension d'autocomplétion la plus exhaustive pour l'écosystème Laravel moderne. Conçue spécifiquement pour **Sublime Text 4**, elle transforme votre éditeur en une véritable IDE capable de comprendre les nouveautés de **Laravel 12.x**, le **AI SDK**, **Laravel Boost**, et l'intégralité de la **TALL Stack**.

---

## 🌟 Points Forts

* **🧠 IA-Native** : Snippets dédiés pour le nouveau AI SDK et les agents Laravel Boost.
* **⚡ TALL Stack Ready** : Autocomplétion profonde pour Filament v4 et Livewire v3/v4.
* **🛠️ Full-Ecosystem** : Couvre Cashier, Socialite, Scout, Reverb, et Pulse.
* **🧪 Test-Driven** : Support complet de Pest PHP et PHPUnit.
* **🚀 Performance** : Fichiers découpés par thématique pour une indexation instantanée sans ralentissement.

---

## 🛠️ Modules Inclus & Capacités

### 🤖 Intelligence Artificielle (New in v12)
Exploitez la puissance des LLM directement dans votre code :
- **AI SDK** : `AI::generate`, `AI::withSchema` (JSON structuré), `AI::chat`, `AI::embed`.
- **Laravel Boost** : Commandes artisan pour les agents IA (`boost:install`, `boost:mcp`).

### 🎨 TALL Stack (Filament & Livewire)
Codez des interfaces complexes sans quitter votre clavier :
- **Filament** : Préfixes `f-` (Formulaires) et `t-` (Tables/Colonnes).
- **Livewire** : Hooks PHP (`lw-render`, `lw-mount`) et Attributs PHP 8 (`#[On]`, `#[Computed]`).
- **Blade** : Directives `@livewire`, `@persist` et attributs `wire:model`.

### 📦 Core & Database
- **Eloquent** : Relations (`belongsTo`, `hasMany`) avec syntaxe `::class`.
- **Migrations** : Colonnes fluides et clés étrangères modernes.
- **Query Builder** : Requêtes complexes, transactions et agrégations.

### 💳 Services & Payments
- **Cashier (Stripe)** : Gestion des abonnements (`cash-sub`), charges et factures.
- **Socialite** : Authentification OAuth simplifiée (`soc-redirect`, `soc-user`).
- **Reverb** : Broadcasting en temps réel et configuration de canaux.

---

## ⌨️ Guide des Raccourcis (Triggers)

| Préfixe | Description | Exemple de Trigger |
| :--- | :--- | :--- |
| **`Route::`** | Méthodes de routage | `Route::get`, `Route::resource` |
| **`AI::`** | Fonctions du AI SDK | `AI::withSchema`, `AI::generate` |
| **`f-`** | Composants Filament | `f-text`, `f-select`, `f-section` |
| **`t-`** | Colonnes Table Filament | `t-text`, `t-badge`, `t-icon` |
| **`lw-`** | Logique Livewire | `lw-render`, `lw-computed`, `lw-on` |
| **`cash-`** | Méthodes Cashier / Stripe | `cash-sub`, `cash-charge` |
| **`soc-`** | Socialite OAuth | `soc-redirect`, `soc-user` |
| **`scout-`** | Recherche Full-Text | `scout-search`, `scout-toSearchable` |
| **`@`** | Directives Blade | `@persist`, `@livewire`, `@auth` |

---

## ⚙️ Installation

### 1. Installation Manuelle
1.  Ouvrez Sublime Text 4.
2.  Allez dans le menu : `Preferences` > `Browse Packages...`.
3.  Créez un dossier nommé `Laravel-12-Ultimate-Suite`.
4.  Placez-y tous les fichiers `.sublime-completions` et le fichier `Laravel.sublime-settings`.

### 2. Configuration des déclencheurs
Pour une expérience optimale (déclenchement automatique après `:` ou `->`), assurez-vous que votre fichier `Laravel.sublime-settings` contient :
```json
{
    "auto_complete_triggers": [
        { "selector": "source.php", "characters": ":" },
        { "selector": "source.php", "characters": ">" },
        { "selector": "text.html, text.plain", "characters": "@" }
    ]
}


```
### 📅 Roadmap & Mises à jour
[ ] Support complet pour Inertia v2.

[ ] Snippets pour Laravel Cloud CLI.

[ ] Intégration des composants Flux UI.

### 📜 Licence

Ce projet est sous licence MIT. Libre pour une utilisation personnelle et commerciale.

Développé pour les artisans du Web par [jocelin kisenga]
