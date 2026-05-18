# Build Tool
Laravel Artisan Command to Build deployable packages for 
AWS Elastic Beanstalk Hosted Projects


## Requirements

  - Laravel 8+
  - Git must be installed ( Add to Vagrant Bootstrap.sh )  
    `sudo apt-get install git`
  - zip must be installed ( Add to Vagrant Bootstrap.sh )  
    `sudo apt-get install zip`
  - NPM and Node ( version??? )  
    
    
    // Install Node manually ( or run /vagrant/ops/nodejs.sh)
    https://nodejs.org/en/



## Installation
Add or Modify the `repositories` array of the composer.json file to
have the following.

    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/southernins/build-tool"
        }
    ],
    
Add the following to require-dev of composer.json

`"southernins/build-tool": "0.0.*"`

Then run `composer update` or `composer install` as needed.


    php artisan list
should then show the following dcommands
    
    build 
    
## Usage

once installed you can build to any env file with the following

    php artisan build --env="file-name"
    

** NOTE **   I copy my local env file to .env.local.  Simply to have a version of my local development envrionment I can copy/paste back into .env should something go wrong.

