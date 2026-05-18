# 🎵 Prestissimo

Prestissimo è una piattaforma web di **compravendita di vinili**, realizzata come **progetto finale di gruppo**, con l’obiettivo di simulare un marketplace moderno.

Il progetto è stato sviluppato come applicazione **full-stack in Laravel 11**, mettendo in pratica i concetti fondamentali dello sviluppo web:
- autenticazione
- CRUD
- relazioni tra modelli
- gestione dei ruoli
- ricerca
- attenzione all’esperienza utente

Il design utilizza una **UI scura ispirata a Netflix**, per valorizzare i contenuti e rendere la navigazione semplice e immediata.

---

## 🚀 Features principali

### 👤 Autenticazione
- Registrazione e login utenti
- Accesso protetto alle funzionalità di inserimento annunci
- Redirect automatico post login/registrazione

### 📀 Annunci
- Creazione annunci tramite **Laravel Livewire**
- Campi obbligatori:
  - titolo
  - descrizione
  - prezzo
  - categoria
- Relazioni:
  - User → Articles (1:N)
  - Category → Articles (N:N)
- Feedback visivo post-creazione

### 🗂️ Categorie
- Categorie pre-popolate tramite seeder
- Disponibili globalmente in tutta l’app
- Filtro annunci per categoria

### 🏠 Homepage & Navigazione
- Ultimi annunci in homepage
- Pagina index con paginazione
- Pagina di dettaglio annuncio
- UI componentizzata (card, navbar, footer)

### 🛡️ Sistema di revisione (Revisor)
- Ruolo **Revisor** gestito via comando Artisan
- Dashboard dedicata ai revisori
- Revisione annunci uno alla volta:
  - Accetta
  - Rifiuta
- Conteggio annunci da revisionare in navbar
- Middleware custom per protezione area revisori
- Possibilità di annullare l’ultima operazione

### 🖼️ Gestione immagini avanzata
- Upload multiplo immagini
- Anteprima live delle immagini
- Rimozione singola immagine
- Crop automatico asincrono
- Watermark applicato alle immagini
- Censura volti per tutela della privacy
- Analisi immagini con **Google Vision API**

> Tutti i processi pesanti sono gestiti in modo asincrono per non rallentare la UX

### 🔍 Ricerca Full-Text

- Ricerca su:
  - Titolo
  - Descrizione
  - Categoria
- Indicizzazione ottimizzata
- Risultati filtrati solo su annunci approvati

### 🌍 Multilingua
- Supporto multilingua con middleware custom
- Cambio lingua tramite bandiere
- Lingue disponibili:
  - 🇮🇹 Italiano
  - 🇬🇧 Inglese
  - JN Giapponese

---

## 🛠️ Stack Tecnologico
- Laravel 11
- PHP
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- MySQL
- Laravel Fortify (auth)
- Laravel Livewire 3
- Google Vision API
- Spatie Image
- GD

---

## 📌 Obiettivi del progetto
- Applicare le basi dello sviluppo **full-stack con Laravel**
- Lavorare in team seguendo una divisione dei compiti
- Simulare un flusso reale di un marketplace (utente → annuncio → revisione)
- Migliorare UX e organizzazione del codice
- Sfruttare metodologia AGILE e SCRUM

---

## 📚 Cosa ho imparato

Durante lo sviluppo di **Prestissimo** ho potuto consolidare e approfondire diversi aspetti fondamentali dello sviluppo web:

- Utilizzare **Laravel** per creare un’applicazione strutturata e manutenibile
- Gestire **CRUD completi**, validazione dei dati e relazioni tra modelli
- Implementare sistemi di **autenticazione e autorizzazione** con ruoli
- Lavorare con **Livewire** per creare componenti dinamici senza JavaScript complesso
- Gestire upload e processamento di immagini
- Implementare una **ricerca full-text** sugli annunci
- Lavorare in **team**, confrontandomi su scelte tecniche e organizzazione del codice
- Comprendere l’importanza di **UX, accessibilità e pulizia dell’interfaccia**

Questo progetto mi ha aiutato a capire come affrontare un progetto reale dall’analisi iniziale fino alla consegna finale.

---

## 👨‍💻 Team di sviluppo

Progetto realizzato come **lavoro finale di gruppo** da:
- Giuseppe Coppolecchia
- Matteo Miglio
- Fabrizio Mulas
- Giovanni Bellanova

Il repository rappresenta il contributo personale e collettivo del team allo sviluppo dell’applicazione.

---

## 📸 Screenshots


### Homepage
![Homepage](screenshots/Homepage.png)

### Indice Annunci
![Index](screenshots/Index.png)

### Dettaglio Annuncio
![Annuncio](screenshots/Detail.png)

### Dashboard Revisor
![Revisor](screenshots/RevisorIndex.png)

