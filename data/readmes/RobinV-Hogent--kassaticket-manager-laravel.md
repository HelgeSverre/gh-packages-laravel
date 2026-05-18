# Uitvoeren van de applicatie

- Zorg ervoor dat er een mysql omgeving klaarstaat

- Vul de correcte data in de (.env) file om met de database te kunnen verbinden
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kassaticket_manager
DB_USERNAME=root
DB_PASSWORD=
```

- voer binnen het project volgend commando uit: php artisan migrate
- maak een admin gebruiker aan met dit commando: php artisan db:seed
    - Hierdoor zal er een gebruiker genaamd Super aangemaakt zijn met volgende credentials
        - email: super@mail.com
        - password: super

- Voor het project uit te voeren
    - Open een terminal en draai het commando: npm run dev
    - Open nog een andere terminal en draai het commando: php artisan serve
