<div align="center">
    <a href="https://livewire.laravel.com" target="_blank"><img src="https://laravel-livewire.com/img/logo.svg" width="400" height="100" alt="Livewire Logo"></a>
    <a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" height="100" alt="Laravel Logo"></a>
</div>

---
<br>

<div align="center">

[![PHP 8.x](https://img.shields.io/badge/php%208.x-%23777BB4?style=plastic&logo=php&logoColor=black)](https://www.php.net/) [![Laravel 12](https://img.shields.io/badge/Laravel%2012-%20%23FF2D20?style=plastic&logo=laravel&logoColor=white)](https://laravel.com/) [![Blade templates](https://img.shields.io/badge/Blade%20templates%20-%20%23FF2D20?style=plastic&logo=laravel&logoColor=white)](https://laravel.com/docs/blade) [![Livewire 3](https://img.shields.io/badge/Livewire%203%20-%234E56A6?style=plastic&logo=livewire&logoColor=white)](https://livewire.laravel.com/) [![Tailwind CSS 4.x](https://img.shields.io/badge/Tailwind%20CSS%204.x-%2306B6D4?style=plastic&logo=tailwind%20css&logoColor=white)](https://tailwindcss.com/) [![Vite 6.x](https://img.shields.io/badge/Vite%206.x-%23646CFF?style=plastic&logo=vite&logoColor=yellow)](https://vitejs.dev/) [![HTML 5](https://img.shields.io/badge/HTML%205-white?style=plastic&logo=html5)](https://developer.mozilla.org/es/docs/Web/HTML) [![SQLite](https://img.shields.io/badge/SQLite-%230e80cc?style=plastic&logo=sqlite)](https://www.sqlite.org/) [![Composer](https://img.shields.io/badge/Composer%20-%20%23885630?style=plastic&logo=composer&logoColor=white)](https://getcomposer.org/)

</div>

<div align="center">

<div align="center">

[![GitHub repo size](https://img.shields.io/github/repo-size/toniGitH/BookReviews?style=plastic&logo=github)](https://github.com/toniGitH/BookReviews) [![GitHub code size](https://img.shields.io/github/languages/code-size/toniGitH/BookReviews?style=plastic&logo=github)](https://github.com/toniGitH/BookReviews) [![GitHub file count](https://img.shields.io/github/directory-file-count/toniGitH/BookReviews?style=plastic)](https://github.com/toniGitH/BookReviews) [![GitHub watchers](https://img.shields.io/github/watchers/toniGitH/BookReviews?style=plastic&logo=github)](https://github.com/toniGitH/BookReviews) [![GitHub forks](https://img.shields.io/github/forks/toniGitH/BookReviews?style=plastic&logo=github)](https://github.com/toniGitH/BookReviews)

</div>

</div>

<div align="center">

[![GitHub followers](https://img.shields.io/github/followers/toniGitH?style=plastic&logo=GitHub&logoColor=black&labelColor=white&color=red)](https://github.com/toniGitH?tab=followers)

</div>



<br/>

# 📚 Aplicación de Reviews de Libros

Esta es una aplicación web para gestionar **reviews de libros**.  
Permite **crear, listar y borrar** reseñas que incluyen:

- **Título**  
- **Autor**  
- **Rating**

> ℹ️ **Nota:** Actualmente no está implementada la función de **actualizar o editar** las reviews.

---

## 🔍 Funcionalidades

- **Crear** nuevas reviews de libros.  
- **Listar** todas las reviews existentes.  
- **Borrar** reviews.  
- **Buscar** reviews por título del libro.

---

## 🛠️ Tecnologías utilizadas

- **Laravel 12**  
- **Livewire 3**  
- **Tailwind CSS** (incluido en la plantilla por defecto de Laravel + Vite)  
- **Vite** para compilación de assets

---

## 🧩 Estructura de la aplicación

La aplicación está construida utilizando **2 componentes de Livewire 3 de página completa**:

1. **Create** → Componente para crear nuevas reviews.  
2. **BookList** → Componente para listar, buscar y borrar reviews.

Estos componentes **de página completa** se renderizan dentro del layout por defecto:

`resources/views/layouts/app.blade.php`

---

## ⚡ Comportamiento como SPA

Gracias a la directiva [`wire:navigate`](https://livewire.laravel.com/docs/navigation), la aplicación **se comporta como una SPA** (Single Page Application):  
- La navegación entre páginas es fluida y sin recargas completas.  
- Los assets y la estructura principal se mantienen cargados en memoria.

---

## 📦 Instalación y ejecución

1️⃣ Haz un **fork** de este repositorio.

Pulsa el botón **Fork** arriba a la derecha.

Al hacer esto, tendrás una **copia** de este repositorio **en tu cuenta de GitHub**.

2️⃣ Clona tu nuevo repositorio fork en tu máquina local:

Elige la ubicación donde se creará la carpeta con el proyecto (por ejemplo, en htdocs, o en una carpeta Proyectos, etc...), y dentro de esa ubicación, ejecuta:

```
git clone <url-de-tu-fork>
```

Dentro de la ubicación que hayas elegido se creará la copia del proyecto, dentro de una carpeta con el nombre del repositorio que has copiado.

Para continuar, debes entrar en esa nueva carpeta (en el proyecto) ejecutando:

```
cd <nombre-de-la-carpeta-del-proyecto>
```

Tras hacer el Fork y clonar el repositorio, tendrás el proyecto en tu máquina local y en tu cuenta de GitHub, con seguimiento de git y vinculados el uno con el otro (podrás hacer pull, fetch, etc...).

Puedes comprobar esto ejecutando:

```
git remote -v
```
Este comando mostrará las URLs de los repositorios remotos asociados a tu copia local, normalmente con el nombre origin. Por ejemplo:

`
origin  https://github.com/tu-usuario/tu-fork.git (fetch)
`

`
origin  https://github.com/tu-usuario/tu-fork.git (push)
`


3️⃣ Instala las dependencias de PHP:

```
composer install
```

4️⃣ Instala las dependencias de Node.js:

```
npm install
```

5️⃣ Configura el archivo .env

Duplica el archivo **env.example** y renómbralo como **.env**.

Puedes hacerlo ejecutando esta instrucción:

```
cp .env.example .env
```

En el nuevo archivo .env (el .env.example puedes dejarlo tal cual está), configura la conexión a la base de datos según tu entorno local.

> 💡 A partir de Laravel 11 (marzo de 2024), la base de datos por defecto es SQLite, así que para probar el proyecto puedes dejarlo así si quieres.

Genera la clave de la aplicación:

```
php artisan key:generate
```

6️⃣ Ejecuta las migraciones y los seeders (el proyecto viene con datos de prueba):

```
php artisan migrate --seed
```

Te saldrá un mensaje avisando que no existe esa base de datos y te preguntará si quieres crearla:

`
WARN The SQLite database configured for this application does not exist: database/database.sqlite  
`

Selecciona: **YES**.

7️⃣ Levanta el servidor de desarrollo y compila los assets:

En una terminal:

```
php artisan serve
```

En otra terminal (para compilar assets en tiempo real):

```
npm run dev
```

> ⚠️ Debes levantar ambos servidores para visualizar la aplicación correctamente.

Tras levantar ambos servidores, podrás acceder a la aplicacion haciendo clic en el enlace que aparecerá en la terminal, que será algo así:

`
INFO  Server running on [http://127.0.0.1:8000].  
`

<br>

> 💡 A partir de Laravel 11.28 (octubre de 2024), ya puedes usar una sola instrucción para hacer ambas cosas:

```
composer run dev
```

> 💡 Para producción, compila los assets con:

```
npm run build
```

---

## 📺 Tutorial de referencia

Esta aplicación fue creada siguiendo el tutorial de YouTube:  
[Curso de Livewire 3 - The Net Ninja](https://youtube.com/playlist?list=PL4cUxeGkcC9htKcjQPGQQL3fQHbIxXowN&si=8idib--aopV2Ihlf)

<br>

---

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
