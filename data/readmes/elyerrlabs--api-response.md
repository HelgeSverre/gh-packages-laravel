# API Response

Extension for APIs under the Laravel framework, includes functions for filtering, searching, sorting, and paginating data, returning it in JSON format.

### Installing the Stable Version

```bash
composer require elyerr/api-response
```

### Installing the Development Version

```bash
composer require elyerr/api-response dev-main
```

#### Install Required Components

```bash
php artisan api-response:install
```

## Functionality of JsonResponser

By default, this functionality is added to the GlobalController. To use it, you can either extend that controller or include the trait in each controller as needed. For more on HTTP response status codes, refer to HTTP response status codes. The default response code is 200.

#### Description and Usage of Functions

```php
 /**
     * Return a message in json format
     * @param mixed $message message
     * @param mixed $code http status code
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function message($message, $code = 200)
```

```php

     /**
     * Return data in json format
     * @param mixed $collection
     * @param mixed $code
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function data($collection, $code = 200)
```

```php

    /**
     * Show one resource la object in json format
     * @param mixed $model Model instance
     * @param mixed $transformer  Model to transform data
     * @param mixed $code Http status code
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function showOne($model, $transformer = null, $code = 200)
```

```php

     /**
     * Show all data from any collection in json
     * @param mixed $collection
     * @param mixed $transformer
     * @param mixed $code
     * @param mixed $pagination
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function showAll($collection, $transformer = null, $code = 200, $pagination = true)
```

```php

     /**
     * Get the columns name form any table
     * @param mixed $table table name
     * @return array
     */
    public function columns_name_table($table)
```

```php
    /**
     * Generate a pagination to the collection
     * @param mixed $collection
     * @param mixed $per_page
     * @return LengthAwarePaginator
     */
    public function paginate($collection, $per_page = 15)
```

```php

    /**
     * Transform the all request using the Transform class for current model
     * through the method getOriginalAttributes
     * @param mixed $transformer
     * @return array
     */
    public function filter_transform($transformer)
```

```php

    /**
     * Filter data using the column of the table
     * @param mixed $table
     * @return array
     */
    public function filter($table)
```

```php

    /**
     * Search values
     * @param mixed $table table name of the model
     * @param array $params params of the model
     * @param string $user_field name of field in the table
     * @param string $user_id current user id
     * @return Collection
     */
    public function search($table, array $params = null, string $user_field = null, string $user_id = null)
```

```php

   /**
     * Order by collection using params order_by and order_type
     * @param \Illuminate\Database\Eloquent\Builder $builder
     * @param mixed $transformer
     * @return void
     */
    public function orderBy(Builder $builder, $transformer = null)
```

## Functionality de Asset

```php
 /**
     * Generate a random string
     * @param int $len
     * @return string
     */
    public function passwordTempGenerate($len = 15)
```

```php

     /**
     * Generate a unique random id
     * @param mixed $id
     * @param mixed $includeDate
     * @param mixed $includeLetters
     * @param mixed $numLetters
     * @return string
     */
    public function generateUniqueCode($id = null, $includeDate = true, $includeLetters = true, $numLetters = 5)
```

```php

  /**
     * Check if two string are different
     * @param mixed $old_value current value on your model
     * @param mixed $new_value key to get by request
     * @param mixed $update_is_null  key to update if the new value is empty
     * @return bool
     */
    public function is_different($old_value, $new_value, $update_is_null = false)
```

```php

    /**
     * Format date in your current country date using a custom header (X-LOCALTIME) in js
     * can use this example  "X-LOCALTIME": Intl.DateTimeFormat().resolvedOptions().timeZone
     *
     * @param mixed $date
     * @param mixed $format default format (Y-m-d H:i:s)
     * @return string
     */
    public function format_date($date, $format = "Y-m-d H:i:s")
```

```php

     /**
     * Checking the time in two dates
     * @param mixed $in time to check
     * @param mixed $out end of time to check
     * @return bool
     */
    public function verify_time_is_between($in, $out)
```

```php

    /**
     * Change key in the transformer model, this work in this functions (transformRequest y transformResponse)
     * @param mixed $index
     * @return array|String|string
     */
    public static function changeIndex($index)
```

```php

    /**
     * Add new string into a file
     * @param string $file file
     * @param int $index index to replace value
     * @param string $value value to replace
     * @param mixed $replace
     * @param bool $repeat
     * @return void
     */
    public function addString($file, $index, $value, $replace = 0, $repeat = false)
```

```php

    /**
     * Transform any file in array collection
     * @param mixed $file
     * @return array
     */
    public function fileToArray($file)
```

```php
    /**
     * Check how many dimension has an array
     * @param mixed $array
     * @return int
     */
    public function array_count_dimension($array)
```

```php
/**
     * Create a standard slug
     * @param mixed $value
     * @return mixed
     */
    public function slug($value, $separator = "_")
```

```php
/**
     * Covert to upper case to lower case
     * @param mixed $value
     * @return string
     */
    public function toKebabCase($value)
```

```php
 /**
     * Convert the request into key names used for settings
     * @param array $data
     * @param string $prefix
     * @return array
     */
    public function transformRequest(array $data, string $prefix = '')
```

```php
/**
     * Format money
     * @param mixed $date
     * @param mixed $decimal_separator
     * @param mixed $thousands
     * @return string
     */
    public function formatMoney($date, $decimal_separator = ".", $thousands = ",")
```

## Functionality of transformers

To create a transformer, use the command `php artisan make:transformer UserTransformer`. You can refer to the [official documentation](https://github.com/spatie/laravel-fractal) for more details.

```php

    /**
     * Transform a collection data to output information to the user
     *
     */
    public function transform($data)
    {
          return [
              'id' => $data->id,
              'name' => $data->name,
              'description' => $data->description,
          ];
    }

    /**
     * Transform request
     * @param string $index
     * @return string|null
     */
    public static function transformRequest($index)
    {
        $attribute = [
            'name' => 'firsName',
            'description' => 'detail',
        ];
        return isset($attribute[$index]) ? $attribute[$index] : null;
    }

    /**
     * Transform response
     * @param string $index
     * @return string|null
     */
    public static function transformResponse($index)
    {
        $attribute = [
            'firsName' => 'name',
            'detail' => 'description',
        ];

        return isset($attribute[$index]) ? $attribute[$index] : null;
    }

    /**
     * Set the attributes to transform filters
     *
     * @param string $index
     * @return string|null
     */
    public static function getOriginalAttributes($index)
    {
        $attributes = [
            'identifier' => 'id',
            'firsName' => 'name',
            'detail' => 'description',
          ];
        return isset($attributes[$index]) ? $attributes[$index] : null;
    }
```

# Apply middleware into the controller

```php
  public function __construct(Model $model){
      $this->middleware('transform.request:' . $model->transformer)
  }
```
