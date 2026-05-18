# DBState — Declarative database schema for Laravel

**DBState is a Laravel tool for managing database schemas using a declarative, schema-as-code approach.**

Describe your tables using simple, versionable `.dbstate.php` files, then DBState synchronizes your database schema — no manual migrations required.

Inspired by the declarative approaches of Ansible and Docker Compose: you declare the desired state, and DBState applies the diff.

---

## 🚀 Features

* **Declarative schema** : describe the desired structure and DBState applies the diff.
* **Automatic table diffs** (add, delete, modify columns).
* **No SQL required**.
<!-- * **Safe mode** to prevent destructive changes. -->
* **Custom root folder** via `DBSTATE_FOLDER`.
* **Schema import** : automatically generate .dbstate.php files from your existing database.

---

## 📦 Installation

```bash
composer require inovxapp/dbstate
```

Publish config and base structure (honoring `DBSTATE_FOLDER` if set):

```bash
php artisan vendor:publish --tag=dbstate
# or publish separated
php artisan vendor:publish --tag=dbstate-config
php artisan vendor:publish --tag=dbstate-database
```

Set `DBSTATE_FOLDER` in your `.env` before publishing if you want to customize the destination folder for all generated files (see below).

---

## ⚙️ Configuration

A config file is published to:

```
config/dbstate.php
```

---

## 📡 Custom Root Folder

Set a custom root folder (optional) in .env files using :

```
DBSTATE_FOLDER=dbstate
```

This lets you place DBState files anywhere in your project.


---

## 📁 Folder Structure

Default structure :

```
config/dbstate.php

database/dbstate/
 ├── actions/
 ├── backups/
 ├── import/
 └── tables/
     └── *.dbstate.php

```

The published configuration file lives in `config/dbstate.php`.

With `DBSTATE_FOLDER=dbstate`:

```
dbstate/
 ├── config/dbstate.php
 └── database/
     ├── actions/
     ├── backups/
     ├── import/
     └── tables/
        └── *.dbstate.php
```

---

## ✨ Quick Start

* Start DBState in terminal:
```bash
php artisan dbstate
```

Need a quieter diff or to include package tables?

```bash
php artisan dbstate --compact          # compact output
php artisan dbstate --with-package-tables    # include tables listed in packages_tables when running CheckDiff
```

* Import your existing tables:
```bash
4/7 - ImportMyDB - Create all DBState table from your DB  
```
This will automatically generate .dbstate.php files from your existing database in the `/import` folder.
Then you can decide to move automatically all this file in the `/tables` folder


* Create a table definition:

```
/tables/posts.dbstate.php <= create *.dbstate.php in the tables folder
```

```php
<?php

// 1 - TABLE NAME
$TableName = "posts";

// 2 - DESIRED STATE
$DesiredTableState = [
    'id' => 'id',
    'title' => ['string' => 255, 'nullable'],
    'type' => ['string' => 255],
    'created_at' => ['timestamp', 'nullable'],
    'updated_at' => ['timestamp', 'nullable'],
];
```

* Apply the desired schema:
1- CheckDiff to create Actions files (migration-like)
```bash
1/7 - CheckDiff - Check diff between DBState table and DB, then plan actions
```

2- RunActions to apply Actions files in your database
```bash
2/7 - RunActions - Apply pending action files (migration-like) to the database  
```

* AuditModels - Used to prevent false positives or missing $casts definitions
```bash
5/7 - AuditModels - Detect DB tables without Laravel models and $cast missing (TableFromPackage, $cast)
```

* Delete a table:

```
/tables/posts.dbstate.php <= delete *.dbstate.php from the tables folder
```


---

## 🛠 Commands

│ ● 1/5 - CheckDiff - Check diff between DBState table and DB, then plan actions   
│ ○ 2/5 - RunActions - Apply pending action files (migration-like) to the database  
│ ○ 3/5 - ImportMyDB - Create all DBState table from your DB  
│ ○ 4/5 - AuditModels - Detect DB tables without Laravel models and $cast missing (TableFromPackage, $cast)  
│ ○ 5/5 - RestoreTable  
│ ○ Exit DBState  

---

## 📘 Writing Schema Files

Each `.dbstate.php` must return an array describing the table.

Available column types:

* id
* string
* integer
* boolean
* json
* text
* timestamp
* etc.

Example with indexes:

```php
return [
    'table' => 'products',
    'columns' => [
        'id' => ['type' => 'id'],
        'name' => ['type' => 'string'],
        'price' => ['type' => 'decimal', 'precision' => 8, 'scale' => 2],
    ],
    'indexes' => [
        ['columns' => ['name'], 'unique' => true],
    ],
];
```

---

## 📚 Examples

More examples are available in:

```
src/exemples/
```

---

## ✨ Advanced usage	

Advanced usage are available in:

```
docs/
```

---

## 📡 Compatibility/Support
Framework :
- Laravel 10
- Laravel 11
- Laravel 12

Database :
    mysql, mariadb


---

## 🧪 Testing

DBState ships with two commands designed for testing and exploration:

ImportMyDB — generates .dbstate.php files from your existing database structure (read-only, does not modify the database).
CheckDiff — shows the diff between your declared schema and the actual database and can generate action files (migration-like files) (read-only, does not modify the database).

---

## 🤝 Contributing

Issues and PRs welcome.
Please format code according to PSR-12.

---

## 🧱 Section “Roadmap / Planned Features”

We are actively expanding DbState.
If you need additional features, feel free to open an issue or request one

---

## 📝 License

dbstate is source-available under the Business Source License 1.1.

You may use it in production and within your company, but you may not use it
to create or offer a competing product or service.

See the [LICENSE](./LICENSE) file for full details.  

---

## ⭐ Support

If DBState saves you time, consider starring the repository!
