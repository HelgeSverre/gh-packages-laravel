# tall-calendar

## add assets

### add js file to your projects js file
    
```js
 import './vendor/team-nifty-gmbh/tall-calendar/resources/js/index';
```

i recommend adding it in the same file you import alpine.

### add css file to your projects css file

```css
@import './vendor/team-nifty-gmbh/tall-calendar/resources/css/calendar.css';
```

add the following to your `tailwind.config.mjs` file

```js
    content: [
        './vendor/team-nifty-gmbh/tall-datatables/resources/views/**/*.blade.php',
        './vendor/team-nifty-gmbh/tall-datatables/resources/js/**/*.js',
    ]
```
