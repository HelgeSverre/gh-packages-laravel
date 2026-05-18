# Yet another way of implementing feature flags

[Laravel Pennant](https://laravel.com/docs/master/pennant) works, for sure, no argument. On the other hand its opinionated and even when there is no need to check each user (or there are no users) for their eligibility for the feature, Pennant will still cache the eligibility for any users who interact with the feature as well as the null user case. Under the hood its ugly in my view for those cases where the feature is either on or off and that's it.

Hence [this package](https://github.com/paulhibbert/features) which has no opinions at all, where the determination of on/off is entirely left to the feature class, whether that includes checking user roles, split test configuration, whether it involves caching and so on.

It provides a blade directive which can be used in templates and layouts. Personally I wanted more control here than just the typical `Route::has('register')` approach - maybe I want to include that check of course but also exclude registration except on local for example.

```php
@feature('AllowRegistration')
    <a href="{{ route('register') }}">Register</a>
@endfeature
```

The service provider will look for a class in app/features namespace (configurable) with the class name AllowRegistration. The class must implement the FeatureInterface which only defines a single method isEnabled which must return a boolean. If the class does not exist the feature is off by default.

There is also a helper function called feature_enabled which can be used anywhere in the application and takes the same string argument. If the class exists and returns true from isEnabled the helper returns true. If the class does not exist it will return false.
