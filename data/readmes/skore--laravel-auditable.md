# Laravel Auditable

Audit the users that performs actions to your application models

## Status

[![packagist version](https://img.shields.io/packagist/v/skore-labs/laravel-auditable)](https://packagist.org/packages/skore-labs/laravel-auditable) [![tests](https://github.com/skore/laravel-auditable/actions/workflows/tests.yml/badge.svg)](https://github.com/skore/laravel-auditable/actions/workflows/tests.yml) [![StyleCI](https://github.styleci.io/repos/246383106/shield?style=flat&branch=master)](https://github.styleci.io/repos/246383106) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/8f09d7031fe341e1a8c8eed9120a0e7b)](https://www.codacy.com/gh/skore/laravel-auditable?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=skore/laravel-auditable&amp;utm_campaign=Badge_Grade) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/8f09d7031fe341e1a8c8eed9120a0e7b)](https://www.codacy.com/gh/skore/laravel-auditable/dashboard?utm_source=github.com&utm_medium=referral&utm_content=skore/laravel-auditable&utm_campaign=Badge_Coverage) [![Scc Count Badge](https://sloc.xyz/github/skore/laravel-auditable?category=code)](https://github.com/skore/laravel-auditable) [![Scc Count Badge](https://sloc.xyz/github/skore/laravel-auditable?category=comments)](https://github.com/skore/laravel-auditable)

## Getting started

```
composer require skore-labs/laravel-auditable
```

And write this on the models you want to have auditables:

```php
<?php

namespace SkoreLabs\LaravelAuditable\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use SkoreLabs\LaravelAuditable\Traits\Auditable;

class Post extends Model
{
    use Auditable;
    // Add this one and it will auto-detect for the deletedBy
    // use SoftDeletes;

    /**
     * The attributes that should be visible in serialization.
     *
     * @var array
     */
    protected $visible = ['title', 'content'];
}
```

And this is how it should look like in your migration file:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostsTestTable extends Migration
{
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title');
            $table->text('content');

            $table->timestamps();
            $table->softDeletes();
            $table->auditables();

            // or if has softDeletes (deleted_at column):
            $table->auditables(true);

            // also you might want to rename the users table:
            $table->auditables(true, 'my_users_table');
        });
    }

    public function down()
    {
        Schema::dropIfExists('posts');
    }
}
```

**Note: If you wanna remove it on the `down` method of your migrations, you can use `dropAuditables`.**

```php
    public function down()
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropAuditables();
            // or if has softDeletes (deleted_at column):
            $table->dropAuditables(true);
        });
    }
```

### Methods

These are all the relationships that the `Auditable` trait provides to your model:

```php
$post = Post::first();

$post->createdBy; // Author of the post
$post->updatedBy; // Author of the last update of the post
$post->deletedBy; // Author of the deletion of the post

$post->author; // Alias for createdBy
```

## Support

This and all of our Laravel packages follows as much as possibly can the LTS support of Laravel.

Read more: https://laravel.com/docs/master/releases#support-policy

## Credits

- Ruben Robles ([@d8vjork](https://github.com/d8vjork))
- Skore ([https://www.getskore.com/](https://www.getskore.com/))
- [And all the contributors](https://github.com/skore-labs/laravel-status/graphs/contributors)
