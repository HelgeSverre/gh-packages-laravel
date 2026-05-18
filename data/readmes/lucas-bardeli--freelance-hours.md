<div align="center"><img src="public/assets/logo.png" width="350" alt="FreelanceHours Logo"></div>

<h3 align="center">
  <img alt="PHP version" src="https://img.shields.io/static/v1?label=php&message=8.4&color=18181B&labelColor=5354FD"> &nbsp;
  <img alt="Laravel version" src="https://img.shields.io/static/v1?label=laravel&message=12&color=18181B&labelColor=5354FD">
</h3>

#
FreelanceHours é uma aplicação desenvolvida em PHP, Laravel e Livewire, onde freelancers podem enviar propostas de horas que podem contribuir em determinado projeto.

<br>

<p align="center">
  <img alt="Preview do projeto desenvolvido." src="public/assets/preview.png" width="80%">
</p>

## 📦 Instalação
```bash
# Clonar repositório
git clone https://github.com/lucas-bardeli/freelance-hours.git

# Entrar na pasta
cd freelance-hours

# Instalar dependências PHP
composer install

# Instalar dependências Node
npm install

# Criar arquivo de ambiente - copia o template
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Rodar as migrations
php artisan migrate

# Rodar a seeder para alimentar o banco com dados falsos
php artisan db:seed

# Iniciar o servidor
php artisan serve

# Compilar assets do front-end automaticamente
npm run dev
```

## 🛠️ Tecnologias utilizadas

- [**PHP**](https://www.php.net/): Linguagem de programação usada;
- [**Laravel**](https://laravel.com/): Framework PHP utilizado para a estrutura e organização do projeto;
- [**Livewire**](https://laravel-livewire.com/): Utilizado para criar interfaces dinâmicas e reativas sem sair do Laravel;
- [**Tailwind CSS**](https://tailwindcss.com/): Framework CSS que facilita o desenvolvimento de interfaces modernas e responsivas.
