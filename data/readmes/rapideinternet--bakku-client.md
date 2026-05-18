<p align="center"><a href="https://admin.bakku.cloud" target="_blank"><img src="https://admin.bakku.cloud/img/logo-bakku-8285dc3fbbae923c5dd447120ec7e5aa.svg?vsn=d" width="300" alt="Bakku Logo"></a></p>

## <span style="color: #00cd91">About Bakku Client</span>

This is a Composer package that handles the data fetching from the <span style="color: #00cd91">Bakku</span> CMS API. You'll be able to get all the blocks/images from a certain page and all page URLs.

## <span style="color: #00cd91">Good to knows:</span>

<span style="color: #00cd91">-</span> Has some built in caching through Laravel's Cache functionality; <br>
<span style="color: #00cd91">-</span> Caching TTL is configurable in the `.env` with `BAKKU_CACHE_TTL`; <br>
<span style="color: #00cd91">-</span> Still a work in progress; <br>

## <span style="color: #00cd91"> How to get it to work:</span>

<span style="color: #00cd91">1.</span> Run `composer config repositories.rapideinternet/bakku-client vcs https://github.com/rapideinternet/bakku-client` to add the package to your `composer.json` <br>
<span style="color: #00cd91">2.</span> Run `composer require rapideinternet/bakku-client:dev-main` to add the package to your `vendor`. <br>
<span style="color: #00cd91">3.</span> Run `php artisan vendor:expose` to generate the `bakkuclient.php` config file. <br>
<span style="color: #00cd91">4.</span> Add `BAKKU_SITE_ID` and `BAKKU_SITE_API_TOKEN` to your `.env` <br>
<span style="color: #00cd91">5.</span> Use `RapideSoftware\BakkuClient\Services\BakkuClient` for the API calls <br>

## <span style="color: #00cd91">For any questions or info:</span>
*<p style="font-size: 10px;">(If I missed anything, please let me know)</p>*
**Slack:** Max van der Werf <br>**Email:** max.vanderwerf@rapide.software