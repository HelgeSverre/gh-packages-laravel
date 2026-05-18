# AutoAjax PHP library

PHP library manages HTTP responses for javascript library [autoAjax.js](https://github.com/crudadmin/autoajax.js). Package is designed for cooperaton of Laravel/PHP with VueJs/PlainJS form submissions and automatic form validation management received from validated response. 

![Example](https://github.com/crudadmin/autoajax.js/raw/master/dist/example2x.gif)

**This is part** of package is for implementation on PHP/Laravel side of application. More for JavaScript/VueJs part of this package on [autoAjax.js](https://github.com/crudadmin/autoajax.js)

## Features
- automatically builds request data from form inputs.
- automatically bind validation error messages to each input from Laravel validation
- VueJs integration
- PlainJs integration

## Composer installation
`composer require "crudadmin/autoajax"`

## Usage

In Laravel controller response
```php
public function store()
{
    //...

    return autoAjax()->success('Thank you! Your for has been successfully sent.');
}
```

If you need throw error message. You need use **throw()** or **render()** method.
```php
//...

//Script dies here
autoAjax()->success('Thank you! Your for has been successfully sent.')->throw();

//...
```

## API
```php
//Success messages.
autoAjax()->success('Success message');
autoAjax()->message('Success message');
autoAjax()->save(); //Global success message will be applied.

//Error messages
autoAjax()->error('Error message with 200 HTTP code');
autoAjax()->error('Error message with 500 HTTP code', 500);
autoAjax()->error('Error message with 500 HTTP code')->code(500);
autoAjax()->error(); //Global error message will be applied.

//Change title of response
autoAjax()->message('Success message')->title('My response title');
autoAjax()->error('Error message')->title('My response title');

//Change HTTP code
autoAjax()->message('My message')->code(500);

//If you want redirect/reload request after response comes. (autoAjax.js will handle it)
autoAjax()->redirect('https://google.com');
autoAjax()->reload();

//If you need run own JS callback after response
autoAjax()->title('This is my message')->callback('alert(1)');

//If you want modify all success/error messages globally. You can do it in AppServiceProvider or somewhere else in your app configuration like that.
autoAjax()->setGlobalMessage('success', 'Changes has been successfully saved.');
autoAjax()->setGlobalMessage('error', 'Something went wrong. Try again later.');
```

## JSON Response
```
{
  callback: null,
  data: [],
  error: false,
  message: "Custom message",
  redirect: null,
  title: "Success",
  type: "message",
}
```

**callback** - Javascript callback for autoAjax library

**data** - Array of additional data for autoAjax library and your responses in VueJs or PlainJs application

**error** - Is response error type?

**message** - Message output.

**redirect** - URL where should be user redirected after response request. AutoAjax.js will handle it.

**title** - Your custom title for modals message.

**type** - Message or modal. You can customize your response for alert messages or for modal windows.

## Validation response
You can throw validation response with Laravel validator
```php
Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
])->validate();
```

You can also throw validation message by your own with **throwValidation** method
```php
autoAjax()->throwValidation([
    'username' => 'Validation message for username',
    'password' => 'Validation message for password',
]);
```

Or manualy send JSON request with error code **422 Unprocessable Entity**
```
{
    "email": ["Please fill this field."],
    "phone": ["Please fill this field."]
}
```
