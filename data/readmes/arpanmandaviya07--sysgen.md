

🚀 Laravel System Builder
--------------------------------

A professional Laravel package that lets you generate complete application scaffolding including:

- 📁 Database Migrations
- 🧬 Eloquent Models
- 🎛️ Controllers
- 🎨 Blade Views

All automatically — powered by a single JSON file.

--------------------------------
📌 Installation & Requirements
--------------------------------

Install the package using Composer:

    composer require arpanmandaviya/laravel-system-builder

Place a JSON definition file anywhere in your Laravel project, for example:

    storage/app/system.json

--------------------------------
⚡ Generate Your System
--------------------------------

Run the build command:

    php artisan system:build --json=storage/app/system.json

To overwrite existing files:

    php artisan system:build --json=storage/app/system.json --force

Note: Gave the Path of The File In The Command Otherwise it Show Error For More Information Please Use 
```Help``` Command

--------------------------------
📁 Example JSON Structure
--------------------------------
```
{
	/*
	|--------------------------------------------------------------------------
	| 1. Table Definitions
	|--------------------------------------------------------------------------
	| Defines database tables, columns, primary keys, and foreign keys.
	| This section drives Migration and Model generation.
	*/
	"tables": [
		{
			"name": "users",
			"columns": [
				{ "name": "id", "type": "bigIncrements" },
				{ "name": "name", "type": "string", "length": 100, "comment": "Full name of the user" },
				{ "name": "email", "type": "string", "length": 150, "unique": true },
				{ "name": "password", "type": "string", "length": 255 },
				{ 
					"name": "role_id", 
					"type": "unsignedBigInteger", 
					"foreign": { 
						"on": "roles",             /* Target table */
						"references": "id",        /* Target column */
						"onDelete": "cascade"      /* MySQL action */
					} 
				}
			]
		},
		{
			"name": "workers",
			"columns": [
				{ "name": "id", "type": "bigIncrements" },
				{ 
					"name": "user_id", 
					"type": "unsignedBigInteger", 
					"foreign": { "on": "users", "references": "id", "onDelete": "cascade" } 
				},
				{ "name": "position", "type": "string", "length": 100 },
				{ "name": "salary", "type": "decimal", "length": "10,2" },
				{ "name": "status", "type": "enum", "values": ["active", "inactive"], "default": "active" } 
			]
		}
	],
	
	/*
	|--------------------------------------------------------------------------
	| 2. Controller Definitions
	|--------------------------------------------------------------------------
	| Explicitly defines controllers to be generated. If a table-based controller
	| (e.g., 'PostController' for table 'posts') is NOT listed here, it is
	| automatically inferred and generated with default resource methods.
	*/
	"controllers": [
		{ "name": "UserController", "table": "users", "model": "User" },
		{ "name": "WorkerController", "table": "workers", "model": "Worker" }
	],

	/*
	|--------------------------------------------------------------------------
	| 3. Model Definitions & Relationships
	|--------------------------------------------------------------------------
	| Defines models and their Eloquent relationships. Used to populate the
	| Model's `$fillable` array and add relationship methods.
	*/
	"models": [
		{ 
			"name": "User", 
			"table": "users", 
			"relations": [
				"role:belongsTo", 
				"workers:hasMany" 
			]
		},
		{ 
			"name": "Worker", 
			"table": "workers", 
			"relations": [
				"user:belongsTo", 
				"tasks:hasMany" 
			] 
		}
	],
	
	/*
	|--------------------------------------------------------------------------
	| 4. View Scaffolding
	|--------------------------------------------------------------------------
	| Defines general view files and structure (not tied to a specific table).
	| Syntax: "{folder}/[file1,file2,file3]" creates files in resources/views/{folder}.
	*/
	"views": [
		"admin/includes/[head]",
		"admin/partials/[sidebar,navbar,footer,script]"
	]
}
```
--------------------------------
🆘 Need Help?
--------------------------------

You can access built-in help:

    php artisan system:help

--------------------------------
📌 Features
--------------------------------

| Feature                                      | Status |
|----------------------------------------------|--------|
| Automatic Migrations                         | ✔      |
| Automatic Models                             | ✔      |
| Automatic Controllers                        | ✔      |
| View Scaffolding                             | ✔      |
| Relationship Support                         | ✔      |
| JSON-based Definition                        | ✔      |
| Foreign Key Generator                        | ✔      |
| Enum / JSON / Custom Field Support           | ✔      |
| GUI Form Designer                            | ⏳ Coming Soon |

--------------------------------
👨‍💻 Author & Credits
--------------------------------

Created with ❤️ by **Arpan Mandaviya**

If you're using this in a commercial product, a mention or sponsorship is appreciated (optional).

--------------------------------
📜 License
--------------------------------

Copyright © 2025-present  
Owner: **Arpan Mandaviya**

Permissions:

✔ Free to use in personal and commercial projects  
✖ Cannot remove credits  
✖ Cannot claim ownership  
✖ Cannot sell modified versions as a competing product

Future versions may introduce licensing terms. Continued usage of updated versions implies acceptance.

--------------------------------
⚠ Warranty Disclaimer
--------------------------------

This software is provided **“AS IS”**, without warranty of any kind.  
Use at your own risk.

-------------------------------
CLI Command Reference
-------------------------------

The Laravel System Builder provides additional optional commands
for generating individual resources without requiring a JSON file.


---------------------------------------
🔥 Laravel System Builder CLI Commands
---------------------------------------

Below is a list of available System Builder commands,
including their help options for guidance.


━━━
📌 Generate Migration Files (Interactive Mode)
━━━

Create new database migration files interactively:

    php artisan system:migrate

View detailed help, supported datatypes, and usage examples:

    php artisan system:migrate --help

━━━
📌 Generate a Model (Existing or New Table Support)
━━━

Create a new Model with optional relationship setup:

    php artisan system:model

View help and available flags:

    php artisan system:model --help



━━━
📌 Generate a Controller (Resource or Standard)
━━━

Create a fully scaffolded controller:

    php artisan system:controller

View controller command syntax, options, and usage guide:

    php artisan system:controller --help



━━━
💡 Tip:
━━━

You can run any of these commands without arguments.
The System Builder will guide you with interactive questions
allowing you to:
```
✔ Select controller type  
✔ Add relationships  
✔ Detect existing tables  
✔ Define columns and keys  
✔ Generate resource boilerplate automatically
```
No JSON file required — everything works interactively.