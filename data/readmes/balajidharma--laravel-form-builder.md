<h1 align="center">Laravel Form Builder</h1>
<h3 align="center">Form Builder to your Laravel projects.</h3>
<p align="center">
<a href="https://packagist.org/packages/balajidharma/laravel-form-builder"><img src="https://poser.pugx.org/balajidharma/laravel-form-builder/downloads" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/balajidharma/laravel-form-builder"><img src="https://poser.pugx.org/balajidharma/laravel-form-builder/v/stable" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/balajidharma/laravel-form-builder"><img src="https://poser.pugx.org/balajidharma/laravel-form-builder/license" alt="License"></a>
</p>

# Laravel Form Builder

Laravel Form builder is forked from [kristijanhusak/laravel-form-builder](https://github.com/kristijanhusak/laravel-form-builder). 

## Table of Contents

- [Installation](#installation)
- [Demo](#demo)
- [Quick start](#quick-start)


## Installation

### Using Composer

```sh
composer require balajidharma/laravel-form-builder
```

Or manually by modifying `composer.json` file:

``` json
{
    "require": {
        "balajidharma/laravel-form-builder": "1.*"
    }
}
```

And run `composer install`

## Demo
The "[Basic Laravel Admin Penel](https://github.com/balajidharma/basic-laravel-admin-panel)" starter kit come with Laravel Form Builder


## Quick start

Creating form classes is easy. With a simple artisan command:

```sh
php artisan make:form Forms/SongForm --fields="name:text, lyrics:textarea, publish:checkbox"
```

Form is created in path `app/Forms/SongForm.php` with content:

```php
<?php

namespace App\Forms;

use BalajiDharma\LaravelFormBuilder\Form;
use BalajiDharma\LaravelFormBuilder\Field;

class SongForm extends Form
{
    public function buildForm()
    {
        $this
            ->add('name', Field::TEXT, [
                'rules' => 'required|min:5'
            ])
            ->add('lyrics', Field::TEXTAREA, [
                'rules' => 'max:5000'
            ])
            ->add('publish', Field::CHECKBOX);
    }
}
```

If you want to instantiate empty form without any fields, just skip passing `--fields` parameter:

```sh
php artisan make:form Forms/PostForm
```

Gives:

```php
<?php

namespace App\Forms;

use BalajiDharma\LaravelFormBuilder\Form;

class PostForm extends Form
{
    public function buildForm()
    {
        // Add fields here...
    }
}
```

After that instantiate the class in the controller and pass it to view:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use BalajiDharma\LaravelFormBuilder\FormBuilder;

class SongsController extends BaseController {

    public function create(FormBuilder $formBuilder)
    {
        $form = $formBuilder->create(\App\Forms\SongForm::class, [
            'method' => 'POST',
            'url' => route('song.store')
        ]);

        return view('song.create', compact('form'));
    }

    public function store(FormBuilder $formBuilder)
    {
        $form = $formBuilder->create(\App\Forms\SongForm::class);

        if (!$form->isValid()) {
            return redirect()->back()->withErrors($form->getErrors())->withInput();
        }

        // Do saving and other things...
    }
}
```

Alternative example:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use BalajiDharma\LaravelFormBuilder\FormBuilder;
use App\Forms\SongForm;

class SongsController extends BaseController {

    public function create(FormBuilder $formBuilder)
    {
        $form = $formBuilder->create(SongForm::class, [
            'method' => 'POST',
            'url' => route('song.store')
        ]);

        return view('song.create', compact('form'));
    }

    public function store(FormBuilder $formBuilder)
    {
        $form = $formBuilder->create(SongForm::class);

        if (!$form->isValid()) {
            return redirect()->back()->withErrors($form->getErrors())->withInput();
        }

        // Do saving and other things...
    }
}
```


If you want to store a model after a form submit considerating all fields are model properties:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use BalajiDharma\LaravelFormBuilder\FormBuilder;
use App\SongForm;

class SongFormController extends Controller
{
    public function store(FormBuilder $formBuilder)
    {
        $form = $formBuilder->create(\App\Forms\SongForm::class);
        $form->redirectIfNotValid();
        
        SongForm::create($form->getFieldValues());

        // Do redirecting...
    }
```

You can only save properties you need:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use BalajiDharma\LaravelFormBuilder\FormBuilder;
use App\SongForm;

class SongFormController extends Controller
{
    public function store(FormBuilder $formBuilder, Request $request)
    {
        $form = $formBuilder->create(\App\Forms\SongForm::class);
        $form->redirectIfNotValid();
        
        $songForm = new SongForm();
        $songForm->fill($request->only(['name', 'artist'])->save();

        // Do redirecting...
    }
```

Or you can update any model after form submit:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use BalajiDharma\LaravelFormBuilder\FormBuilder;
use App\SongForm;

class SongFormController extends Controller
{
    public function update(int $id, Request $request)
    {
        $songForm = SongForm::findOrFail($id);

        $form = $this->getForm($songForm);
        $form->redirectIfNotValid();

        $songForm->update($form->getFieldValues());

        // Do redirecting...
    }
```

Create the routes

```php
// app/Http/routes.php
Route::get('songs/create', [
    'uses' => 'SongsController@create',
    'as' => 'song.create'
]);

Route::post('songs', [
    'uses' => 'SongsController@store',
    'as' => 'song.store'
]);
```

Print the form in view with `form()` helper function:

```html
<!-- resources/views/song/create.blade.php -->

@extends('app')

@section('content')
    {!! form($form) !!}
@endsection
```

Go to `/songs/create`; above code will generate this html:

```html
<form method="POST" action="http://example.dev/songs">
    <input name="_token" type="hidden" value="FaHZmwcnaOeaJzVdyp4Ml8B6l1N1DLUDsZmsjRFL">
    <div class="form-group">
        <label for="name" class="control-label">Name</label>
        <input type="text" class="form-control" id="name">
    </div>
    <div class="form-group">
        <label for="lyrics" class="control-label">Lyrics</label>
        <textarea name="lyrics" class="form-control" id="lyrics"></textarea>
    </div>
    <div class="form-group">
        <label for="publish" class="control-label">Publish</label>
        <input type="checkbox" name="publish" id="publish">
    </div>
</form>
```

Or you can generate forms easier by using simple array
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use BalajiDharma\LaravelFormBuilder\FormBuilder;
use BalajiDharma\LaravelFormBuilder\Field;
use App\Forms\SongForm;

class SongsController extends BaseController {

    public function create(FormBuilder $formBuilder)
    {
        $form = $formBuilder->createByArray([
                        [
                            'name' => 'name',
                            'type' => Field::TEXT,
                        ],
                        [
                            'name' => 'lyrics',
                            'type' => Field::TEXTAREA,
                        ],
                        [
                            'name' => 'publish',
                            'type' => Field::CHECKBOX
                        ],
                    ]
            ,[
            'method' => 'POST',
            'url' => route('song.store')
        ]);

        return view('song.create', compact('form'));
    }
}
```
