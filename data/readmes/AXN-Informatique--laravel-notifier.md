Laravel Notifier
================

Package Laravel pour uniformiser et simplifier l'enregistrement et l'affichage des messages/alertes dans les interfaces web.

**Attention** : à ne pas confondre avec les « [Notifications](https://laravel.com/docs/notifications) » de Laravel. Ce package utilise les « [Session Flash Data](https://laravel.com/docs/session#flash-data) ».


Installation
------------

```sh
composer require axn/laravel-notifier
```

Le service provider est auto-découvert par Laravel.


Utilisation rapide
------------------

### Déclarer des messages

```php
// Messages flash (affichés après redirection)
notify()->success('Post '.e($post->title).' mis à jour.');

return back();

// Messages instantanés (affichés dans la requête courante)
notify()->nowInfo('Édition de '.e($post->title));

return view('post.edit');
```

Les quatre types disponibles : `info`, `success`, `warning`, `error`.

### Afficher les messages

```blade
<x-notify />
```

### Sécurité XSS

Les variables `$message` et `$title` sont rendues en **HTML brut** dans les templates. **Toujours échapper** les données utilisateur avec `e()` :

```php
// ✅ Correct
notify()->success('Post '.e($post->title).' mis à jour.');

// ❌ Faille XSS
notify()->success('Post '.$post->title.' mis à jour.');
```


Documentation
-------------

La documentation complète est disponible dans le dossier [`docs/`](docs/_index.md) :

- [Installation et configuration](docs/installation.md)
- [Déclaration des messages](docs/utilisation.md) — flash, instantanés, titres, délais, stacks, conditionnels
- [Affichage des messages](docs/affichage.md) — composant Blade, attributs, tri, groupement
- [Templates de vues](docs/templates.md) — Bootstrap 4/5, SweetAlert2, PNotify
- [Personnalisation](docs/personnalisation.md) — créer son propre template


Mises à jour
------------

Consultez le fichier [`UPGRADE.md`](UPGRADE.md) pour les instructions de mise à jour.


Licence
-------

MIT
