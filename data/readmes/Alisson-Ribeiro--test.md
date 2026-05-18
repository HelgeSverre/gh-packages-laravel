![GitHub License](https://img.shields.io/github/license/Alisson-Ribeiro/test?style=flat-square)
<br>
![GitHub Repo Size](https://img.shields.io/github/repo-size/Alisson-Ribeiro/test?style=flat-square)
<br>
![GitHub Issues](https://img.shields.io/github/issues/Alisson-Ribeiro/test?style=flat-square)
<br>
![GitHub Stars](https://img.shields.io/github/stars/Alisson-Ribeiro/test?style=flat-square)
<br>

📧 E-mail: alissonribeirow1@gmail.com
<br>
🐙 GitHub: Alisson-Ribeiro
<br>
💼 LinkedIn: https://www.linkedin.com/in/alisson-ribeiro-69680653/

🤝 Contribuindo
<br>
<br>
Contribuições são bem-vindas!
<br>
<br>
Para contribuir:
<br>
<br>
Fork o repositório
<br>
Crie um branch (git checkout -b minha-nova-feature)
<br>
Faça um commit (git commit -m 'Adicionando nova feature')
<br>
Faça um push para o branch (git push origin minha-nova-feature)
<br>
Abra um Pull Request

## PT-BR
## Instalar esse projeto no seu ambiente de desenvolvimento é simples

## você irá precisar de 3 terminais:

### - 1 para 'php artisan seve', é o servidor da sua aplicação e deve ser mantido 'rodando';
### - 1 para 'php artisan queue:work', também deve ser mantido 'rodando' para enfileirar jobs;
### - 1 para outros comandos.

## rode os comandos na sua linha de comando na seguinte ordem:

- git clone project
- 'cd' para dentro da pasta raiz
- composer install
- npm install
- copie '.env-example'
- cole '.env-example' (mesmo diretório, raiz nesse caso)
- renomeie de: '.env-example' para: '.env'
- configure seu banco de dados no arquivo '.env'
- configure seu serviço de email no arquivo '.env' para entrega de email após a criação de cada Colaborador

  	- MAIL_MAILER=smtp
  	- MAIL_HOST= // seu servidor
  	- MAIL_PORT=2525
  	- MAIL_USERNAME= // seu usuário
  	- MAIL_PASSWORD= // sua senha
  
- php artisan migrate
- php artisan db:seed
- php artisan key:generate
- php artisan serve
- php artisan queue:work

## infelizmente será necessário fazer a adição de um usuário ao banco através do recurso 'php artisan tinker' pois não tive tempo hábil para solucinar um bug na rota de registro
### use App\Models\User;
### use Illuminate\Support\Facades\Hash;

### User::create([
    'name' => 'Novo Usuário',
    'email' => 'novousuario@example.com',
    'password' => Hash::make('senha1234'),
]);


## EN-US
## Installing this project to your development enviroment is that simple

## you will need 3 terminals:

### - 1 for 'php artisan seve', it's your application server and must be kept running;
### - 1 for 'php artisan queue:work', also must be kept running to queue jobs;
### - 1 for other commands

## run the following commands in your CLI in the following order:

- git clone project
- cd into project root folder
- composer install
- npm install
- copy '.env-example'
- paste '.env-example' (same directory, root in this case)
- rename '.env-example' to '.env'
- set your database in '.env' file
- set '.env' file with your (SMTP) email service provider info to deliver email after the creation of a new Colaborador

  	- MAIL_MAILER=smtp
  	- MAIL_HOST= // your host
  	- MAIL_PORT=2525
  	- MAIL_USERNAME= // your username
  	- MAIL_PASSWORD= // your password
  
- php artisan migrate
- php artisan db:seed
- php artisan key:generate
- php artisan serve
- php artisan queue:work

## Unfortunately, it will be necessary to add a user to the database using the 'php artisan tinker' feature as I did not have enough time to resolve a bug in the registration route
### use App\Models\User;
### use Illuminate\Support\Facades\Hash;

### User::create([
    'name' => 'Novo Usuário',
    'email' => 'novousuario@example.com',
    'password' => Hash::make('senha1234'),
]);
