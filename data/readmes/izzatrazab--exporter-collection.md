# Collection of Exporters

## About
I gathered all types of exports I've used in the past as reference. 

## Main Items
1. Laravel Snappy PDF - generate pdf from blade
2. Mailwind - convert tailwind classes to css styles
3. soon to be updaated

## Steps to Setup
1. composer install
2. pnpm install (or any node package manager that you use)
3. pnpm install mailwind -g
4. Set up your .env file (you can copy the supplied .env.example) and replace the `SNAPPY_MACHINE` value with your machine type. Check config/snappy to see what’s happening under the hood. I’ve already included wkhtml binaries for several architectures.
5. php artisan migrate
6. php artisan key:generate

## Contributing
Feel free to open an issue or submit a pull request.
