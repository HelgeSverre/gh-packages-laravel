Laravel Package based on 

* IBAN Validation based on: jschaedl/iban-validation

## Benötigte Config
company.php

```php
<?php

return [
    /* ... */
    'name' => 'My Company', // Default Value, if Accountholder is not set
    'bankaccounts' => [
        'nameOrNumber' => [
            'iban' => 'IBAN123467543',
            'bic' => 'BICCCC',
            'bank' => 'BANKNAME',
            'accountholder' => 'My Accountholder'
        ]
    ],
    /* ... */
];
```

Purpose-Code-Data from: https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets