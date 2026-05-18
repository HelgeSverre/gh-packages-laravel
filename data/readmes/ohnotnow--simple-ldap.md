*WIP*

# Simple LDAP package for Laravel

This is a very, very simple and very specific LDAP package.  It's really
just a wrapper of code I usually copy from project to project to do LDAP
lookups of our local LDAP server, so it's usefulness outside of that is
probably quite limited. But it might be useful as a basis for your own setup.

## Installation

```
composer require ohffs/simple-laravel-ldap 
```

I'm assuming this is for Laravel 5.5+ so it should auto-discover the service providers.  You can
then publish the config file :

```
php artisan vendor:publish
```
And pick the 'Ohffs\Ldap\LdapServiceProvider' option which will create a `config/ldap.php` file. This
just looks for two env variables which you should set - LDAP\_SERVER and LDAP\_OU eg,

```
LDAP_SERVER=ldap.your-domain.com
LDAP_OU=Staff
```

## Usage

You can use the facade to access the main methods :

```
if (\Ldap::authenticate('username', 'password')) {
  // whatever
}

$user = \Ldap::findUser('jenny123');
dump($user);
/*
Ohffs\Ldap\LdapUser {#739
  #username: "jenny123"
  #email: "Jenny@example.com"
  #surname: "Smith"
  #forenames: "Jenny"
  #phone: "012345678"
}
*/
print $user['email'];
// 'Jenny@example.com'
print $user->email;
// 'Jenny@example.com'
print $user->toArray();
/*
[
     "username" => "jenny123",
     "email" => "Jenny@example.com",
     "surname" => "Smith",
     "forenames" => "Jenny",
     "phone" => "012345678",
]
*/
```

Or if you want to use the container/DI just typehint on 'Ohffs\Ldap\LdapService':

```
use Ohffs\Ldap\LdapService;

public function __construct(LdapService $ldap)
{
    $this->ldap = $ldap;
}

public function something()
{
   if ($this->ldap->authenticate('username', 'password')) {
       // ...
   }
}
```

