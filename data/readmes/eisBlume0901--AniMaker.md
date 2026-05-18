# AniMaKer
An anime catalog and review website created by Mary Kate Anecito and Marvin Flores. Powered by Tailwind and Laravel.

![ERD](https://i.ibb.co/PzP1X7qW/ERD-OOP-Diagrams-Page-1.jpg)

Demo Video: [https://youtu.be/qLLjLWO9vc0](https://youtu.be/lwvtoxMY1nw)

## How to install via VS Code
### Prerequesites
>Visual Studio Code <br>
>Git <br>
>Composer <br>
### 1. Copy the git web URL

In this case, it would be:
https://github.com/eisBlume0901/AniMaker.git

![GitHub Link](https://i.ibb.co/DGrzCtX/image-4.png)

### 2. Open Visual Studio Code
Click on 'Clone Git Repository...' and paste the link above
![alt text](https://i.ibb.co/b5pLdWQ/image-5.png)

### 3. Open Visual Studio Code's terminal

```git clone https://github.com/eisBlume0901/AniMaker.git```

### 4. Setup Laravel

At this point, the project has been successfully cloned. Laravel requires further setups to run the project.

Open the terminal (Ctrl + Shift + `) and type
```npm install``` to install Node Module and ```composer install``` to install your Vendor file.

### 5. Setup Database
Duplicate the ```.env.example``` file and rename it to ```.env```

Individually run the lines of SQL commands found in ```mysql_ddl_commands``` file in MySQL admin
This will ensure the creation of an SQL database for the next step.
### 6. Final touches

Run the following commands in the terminal in your VS Code by order

```
php artisan key:generate

php artisan migrate:refresh --seed

php artisan storage:link

php artisan serve

npm run dev

```

The artisan commands will initialize the ```animaker_db``` database, and will open a link to the website.
### Caveat
Run every commands individually.
