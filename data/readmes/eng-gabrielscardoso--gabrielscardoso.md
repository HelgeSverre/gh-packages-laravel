<div align="center">

<h1>Gabriel Santos Cardoso Personal Portfolio</h1>

<img src="https://go-skill-icons.vercel.app/api/icons?i=php,laravel,tailwind,livewire,filament,pint,mysql,nginx,docker,digitalocean,cloudflare,github,githubactions,linux,vscode" alt="Tech specification" />

<br>

</div>

**Author:** Gabriel Santos Cardoso

**Created:** 30/05/2024

## Summary

This is a simple personal portfolio to expand and improve my professional portfolio and be a way to demonstrate my skills, and experiences and be in contact with me. Also, in future, this project will be refactored to be a white-labelled portfolio solution for any developer, with enough cloning and configuring to be set up and go on production.

## Specification

This application uses, in summary:

- Laravel (powered by Sail)
- Livewire
- TailwindCSS
- DaisyUI
- MySQL
- Mailpit
- AWS
- Cloudflare
- DigitalOcean
- GitHub Actions
- Any IDE or text editor

## Implementation

Before installation make sure to have the most recent version of Docker and Docker Compose installed in your system.

For a fresh installation you must run the following command to install the dependencies without the necessity do the installation of any SDK:

```sh
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

After the completion, you could add the following alias in your `.bashrc`, `.zshrc`, or whatever to improve your experience with Sail:

```sh
alias sail="sh $([ -f sail ] && echo sail || echo vendor/bin/sail)"
```

After this, clone the `.env.example` into `.env` and run `sail up -d` to up your containers.

Then, you could work as you want, for any help tip `sail` in your terminal.

## Copyright

This project is licenced under the [MIT Licence](LICENSE)
