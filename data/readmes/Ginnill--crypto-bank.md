# BSS Cripto

Web system for managing crypto wallets, deposits, swaps, and transaction history.

## Features

- Dashboard with total balance and quick tools
- Crypto deposit and trading
- Swap between different coins
- Transaction history
- User profile with editable data and address
- Account verification

## Technologies

- Laravel 11+
- Livewire
- TailwindCSS
- PHP 8+
- PostgreSQL

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bsscripto.git
   cd bsscripto
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env` and set your variables (DB, MAIL, etc).
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Run database migrations**
   ```bash
   php artisan migrate
   ```

5. **Compile assets**
   ```bash
   npm run dev
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

## Usage

- Access `http://localhost:8000` in your browser.
- Create an account and log in.
- Add wallets, make deposits, swap coins, and track your history.

## Useful Scripts

- **Update dependencies**
  ```bash
  composer update
  npm update
  ```
- **Run tests**
  ```bash
  php artisan test
  ```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
