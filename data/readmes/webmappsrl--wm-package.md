# Webmapp Laravel wm-package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/wm/wm-package.svg?style=flat-square)](https://packagist.org/packages/wm/wm-package)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/wm/wm-package/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/wm/wm-package/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/wm/wm-package/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/wm/wm-package/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/wm/wm-package.svg?style=flat-square)](https://packagist.org/packages/wm/wm-package)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require wm/wm-package
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="wm-package-migrations"
php artisan migrate
```

You can publish the config file with :

```bash
php artisan vendor:publish --tag="wm-package-config"
```

## Usage

You can use Services with:

ServiceClass::make()->method()
eg: `GeometryComputationService::make()->convertToPoint($model)`

You can use Models with or without extending them:
`class MyEcTrackModel extends Wm\WmPackage\Models\EcTrack {...}`

You can use Nova resources extending them:
`class MyEcTrackNovaResource extends Wm\WmPackage\Nova\EcTrack {...}`

You can use all package APIs with related controllers, see them with `php artisan route:list`

You can use all clients with dependency injection or with other instanciation methods:
`app( Wm\WmPackage\Http\Clients\DemClient::class)->getTechData($geojson);`

## Update

You can update the package via composer:

```bash
composer update wm/wm-package
```

or updating it as submodule

## Developing

To use docker containers you need to run `docker compose up -d` and enter inside with `docker compose exec -it php bash` or directly `docker compose exec -it php composer test` (check permissions on files before run it, if you have problems use the `-u` param on exec command with the id of the user who owns project files and directories, to check your current user id you can use the command `id`).

Docker has the following containers:

-   php
-   postgres
-   redis
-   elasticsearch

You can use them with testbench to run a complete Laravel instance with this package (see testing section for more details). Eg, you can use tesbench to run artisan commands:
`./vendor/bin/testbench migrate`

We use conventional commits for commit's messages (https://www.conventionalcommits.org/en/v1.0.0/). Create a feature/fix branch from main then ask a PR to merge it into develop branch.

### On a laravel instance

If you need this package on full laravel instance you have to add this repository as submodule in the root path of Laravel with `git submodule add {git repo}`, then add a new composer path repository in the laravel `composer.json` file:

```json
"repositories": [
        {
            "type": "path",
            "url": "./wm-package"
        }
    ]
```

at last you can install the package with `compose require wm/wm-package`

## JWT

JWT will be installed automatically as a dependency. Users only need to configure the JWT environment variables in the `.env` file using the command `php artisan jwt:secret`.

The JWT package is managed as a dependency of wm-package and does not need to be installed separately in the main application.

## Elasticsearch

https://laravel.com/docs/11.x/scout
https://github.com/matchish/laravel-scout-elasticsearch

elasticsearch mapping and settings:
config/wm-elasticsearch.php

elasticsearch controller:
src/Http/Controllers/Api/ElasticsearchController.php

## Geohub Import

This package provides an Artisan command to import data from Geohub. To ensure data integrity and correctly process all relationships, **the import process must start from an `app` entity.** The command will then import all related data in a cascading manner.

The import architecture is structured around a pattern of services, jobs, and a central configuration, with an Artisan command as the entry point.

### Architecture Overview
The main components are:
1.  **CLI Command (`WmImportFromGeohubCommand`):** The entry point to initiate imports.
2.  **Services (`GeohubImportService`, `EcMediaImportService`):** Handle the core business logic, data transformation, and orchestration.
3.  **Jobs (e.g., `ImportAppJob`, `ImportEcTrackJob`):** Perform specific import operations for different entities in the background.
4.  **Configuration (`config/wm-geohub-import.php`):** Contains mappings, database connections for Geohub, and other settings that define how the import process behaves.

### Command Usage

The main command is `wm:import-from-geohub`.

1.  **Import a specific application and its related data:**
    This is the standard way to import a complete set of data related to a specific application.
    ```bash
    php artisan wm:import-from-geohub app <geohub_app_id>
    ```
    Replace `<geohub_app_id>` with the ID of the application in Geohub.

2.  **Import all applications and their related data:**
    If no model or ID is specified (or if `app` is specified without an ID), the command will import all `app` entities from Geohub, subsequently triggering the import for all their related data.
    ```bash
    php artisan wm:import-from-geohub
    ```
    Or:
    ```bash
    php artisan wm:import-from-geohub app
    ```

### Import Process Deep Dive

The import process is orchestrated by `GeohubImportService`.

#### 1. `GeohubImportService` - The Core Orchestrator
This service is central to the import system and manages:
*   **Geohub Database Connection:** Connects to the Geohub source database using credentials and settings defined in `config/wm-geohub-import.php`.
*   **Orchestration:** Coordinates the import of different entities. While the primary flow starts with an `app` and cascades, the service internally might respect a specific order for fetching or processing, defined by constants like `MODEL_IMPORT_ORDER` if applicable for broad imports.
    ```php
    // Example:
    // protected const MODEL_IMPORT_ORDER = [ 
    //  'app', 
    //  'ec_poi', 
    //  // ... other models
    // ];
    ```
*   **Data Transformation:** Converts data from Geohub's format to the local application's format, often leveraging the `DataTransformer` utility.
*   **Relationship Management:** Ensures that associations between entities are correctly established and maintained during the import.

#### 2. Data Mapping and Configuration (`config/wm-geohub-import.php`)
This crucial configuration file defines how different entities are handled. For each entity type, it specifies:
*   `namespace`: The local Eloquent model's namespace.
*   `job`: The dedicated import Job class for that entity.
*   `geohub_table`: The source table name in the Geohub database.
*   `identifier`: The field used as a unique identifier (e.g., `custom_properties->geohub_id`).
*   `fields`: Mapping of source fields to target fields.
*   `properties`: Mapping for JSON properties.
*   `relations`: Definitions for handling relationships with other entities.

**Example: `ec_media` configuration snippet:**
```php
'ec_media' => [ 
    'namespace' => 'Wm\WmPackage\Models\Media', 
    'job' => ImportEcMediaJob::class, 
    'geohub_table' => 'ec_media', 
    'identifier' => 'custom_properties->geohub_id', 
    'fields' => [
        // 'local_field_name' => 'geohub_field_name',
    ], 
    'properties' => [
        // 'local_property_name' => 'geohub_property_name',
    ],
    'relations' => [
        // 'relation_name' => [...]
    ], 
],
```

#### 3. Job Hierarchy and Structure
Import jobs are organized hierarchically to share common logic:
*   **`BaseImportJob`:** The base class for all import jobs. It manages the general import workflow (fetch, transform, import, process dependencies) and provides common data transformation utilities.
*   **`BaseEcImportJob`:** Extends `BaseImportJob` specifically for "EC" entities (e.g., `EcTrack`, `EcPoi`). It handles common tasks like converting 2D geometries from Geohub to 3D and setting default values for missing geometries.
*   **Specific Jobs (e.g., `ImportAppJob`, `ImportEcPoiJob`, `ImportEcTrackJob`, `ImportLayerJob`, `ImportTaxonomyJob` and its derivatives):** Implement logic tailored to each entity type.

Each job typically follows a structure with these key methods:
*   `fetchData()`: Retrieves raw data from the Geohub database for the specific entity.
*   `transformData()`: Converts the fetched data into the format required by the local models, often using `DataTransformer`.
*   `importData()`: Creates or updates the entity in the local database.
*   `processDependencies()`: Handles the import or linking of related entities.

#### 4. Data Transformation (`DataTransformer`)
The `DataTransformer` class is a utility responsible for converting data types and structures.
*   **Key Features:**
    *   Format Conversion: Transforms data between JSON, arrays, booleans, dates, etc.
    *   Normalization: Standardizes incoming data.
    *   Multilingual Data Handling: Converts JSON strings containing translations (e.g., `{"it":"Nome","en":"Name"}`) into associative arrays for translatable model attributes.
    *   Implicit Validation: Manages null or empty values appropriately.
*   **Core Methods:**
    *   `jsonToArray()`: Converts JSON strings to PHP arrays.
    *   `stringToBoolean()`: Converts string representations of booleans to actual boolean values.
    *   `stringToDate()` / `dateToString()`: Handles date conversions.
    *   `geojsonToGeometry()`: Processes GeoJSON data into geometry objects.
*   **Integration:** `DataTransformer` methods are typically invoked from the mapping configuration within `config/wm-geohub-import.php` or directly within job transformation logic.

**Example: Transforming a translatable `name` field:**
Mapping in `wm-geohub-import.php`:
```php
'name' => [ 
    'field' => 'name', // Source field in Geohub data
    'transformer' => [DataTransformer::class, 'jsonToArray'] 
]
```
If Geohub `name` is `{"it":"Sentiero del Monte","en":"Mountain Trail"}`, it's transformed to `['it' => 'Sentiero del Monte', 'en' => 'Mountain Trail']`.

#### 5. Special Case: Media Import (`ImportEcMediaJob` & `EcMediaImportService`)
Media import (images, files) involves `ImportEcMediaJob` and potentially `EcMediaImportService` for more complex scenarios:
1.  **Data Retrieval:** Fetches media metadata from Geohub.
2.  **Relationship Identification:** Determines which local entity the media is associated with.
3.  **Download & Upload:** Downloads the actual file from Geohub's storage and uploads it to the configured local storage (e.g., AWS S3 via Spatie Media Library).
4.  **Metadata Storage:** Saves relevant metadata, including custom properties.

#### 6. Queues, Batching, and Error Handling
*   **Asynchronous Processing:** All import operations are dispatched as jobs to a configurable queue (default: `geohub-import`) for background processing, which is essential for handling large datasets.
*   **Batching:** Jobs are often grouped into batches. Batches can be configured with failure tolerance, allowing the overall import to continue even if some individual jobs fail.
*   **Logging:** Comprehensive logging is implemented. Operations are logged to a dedicated channel (configurable via `wm-geohub-import.import_log_channel`, e.g., `storage/logs/wm-package-failed-jobs.log`).
*   **Exceptions:** Specific exceptions are used to provide detailed error messages, aiding in debugging.

#### 7. Performance Considerations
The system is designed to handle potentially large volumes of data:
*   **Queues & Jobs:** Laravel's queue system distributes the workload.
*   **Batching:** Efficiently processes groups of jobs.
*   **Horizon:** Laravel Horizon can be used to monitor and manage the queues.

### Summary of Import Flow
When an import is initiated (typically for an `app`):
1.  `WmImportFromGeohubCommand` delegates to `GeohubImportService`.
2.  `GeohubImportService` connects to the Geohub DB and identifies entities to import (starting with the specified `app` or all `app`s).
3.  It creates and dispatches a batch of jobs (e.g., `ImportAppJob`).
4.  Each job in the sequence:
    a.  Fetches data from Geohub (`fetchData`).
    b.  Transforms data using mappings and `DataTransformer` (`transformData`).
    c.  Creates or updates the entity in the local database (`importData`).
    d.  Queues further jobs for dependent entities (`processDependencies`).
5.  Media imports handle file downloads/uploads separately.
6.  The process is logged, and errors are managed to ensure robustness.

This architecture provides a modular, robust, configurable, and scalable process for synchronizing data from Geohub.

## Testing

```bash
composer test
```

These tools are used to test the stand alone instance of wm-package: https://packages.tools/

Execute these commands to runs tests:

`./vendor/bin/testbench vendor:publish --tag="wm-package-migrations"`
`./vendor/bin/testbench migrate`
It migrates workbench tables on a postgres database.

`composer test`
To run tests.

If an evaluation of testbench env I suggest to use the `config()` function (eg: `config('database.connections')`) with the testbench implementation of tinker `./vendor/bin/testbench tinker`, it is also useful to understand which things are loaded on the testbench env.

Testbench reference: https://packages.tools/testbench.html
Workbench reference: https://packages.tools/workbench.html

Also a simple php docker container is available to run tests, you can start it using `docker compose up -d` and enter inside with `docker compose exec -it php bash` or directly `docker compose exec -it php composer test` (check permissions on files before run it, if you have problems use the `-u` param on exec command with the id of the user who owns project files and directories, to check your current user id you can use the command `id`).

## Pushing

We use convetional commits (https://www.conventionalcommits.org/en/v1.0.0/) to add commits to this repo. Please create a new branch then push it and ask a pull request via github interface from your feature/fix branch to develop.

Run `./vendor/bin/phpstan` before push to evaluate phpstan suggestions

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Docs

https://github.com/spatie/laravel-package-tools

https://laravel.com/docs/9.x/facades#facades-vs-dependency-injection

https://pestphp.com/

https://packages.tools
