[![Rosalana](https://raw.githubusercontent.com/rosalana/.github/main/Configure_Banner.png)](https://github.com/rosalana)

**Rosalana Configure** is a low-level engine for **programmatic, structure-safe manipulation of Laravel configuration files.**

It allows you to **read, modify, generate and reorganize config files** while **preserving formatting, order, comments, and developer intent.**

This package is designed primarily for:

- Laravel **package authors**
- tooling and installers
- automated configuration workflows
- advanced configuration migrations

## Installation

```bash
composer require rosalana/configure
```

## Why Configure?

Laravel configuration files are PHP code — not simple data structures.

Editing them reliably means dealing with:

- nested arrays
- comments
- formatting
- ordering
- developer edits
- partial updates

**Rosalana Configure does not treat config files as arrays.**
It treats them as a **structured document** composed of nodes.

> [!NOTE]
> Think of it more like a DOM or AST for Laravel config files.

## Core Concepts

### Nodes

Every configuration file is represented as a **tree of nodes:**

| Node Type     | Description                            |
| ------------- | -------------------------------------- |
| `File`        | Root of the configuration file         |
| `Section`     | An array block (`'database' => [...]`) |
| `Value`       | A single key-value pair                |
| `Comment`     | Single-line comment (`//`)             |
| `RichComment` | Laravel-style block comment (`/* */`)  |

All operations are performed **by selecting nodes**, not by mutating arrays.

---

### Selection Model

Selection works similarly to **browser dev tools:**

- You select a node
- Operate on it
- Scope moves automatically to make chaining intuitive

```php
use Rosalana\Configure\Configure;

$file = Configure::file('database');
```

---

### Sections vs Values

- **Sections** represent arrays
- **Values** represent scalar or expression values

```php
$file->section('connections');
$file->value('default');
```

You can traverse deeper:

```php
$file->section('connections')
          ->section('mysql')
               ->value('host');
```

Or jump directly using a full path:

```php
$file->value('connections.mysql.host');
```

---

### Automatic Creation

If a section or value does not exist, it is **created automatically.**

> New nodes are always appended to the end of their parent section.

```php
$file->value('connections.mysql.host', 'localhost');
```

## Working with Values

```php
$value = $file->value('connections.mysql.host');

$value->get();               // current value
$value->set('localhost');    // hard set
$value->add('localhost');    // soft set
$value->remove();            // delete value
```

### Soft assignment

```php
$file->value('connections.mysql.host', 'localhost');
```

Sets the value **only if it does not already exist.**

---

### Value typing

Always pass values as **strings.**
The engine resolves the correct PHP representation.

```php
$value->set('3306');                         // int
$value->set('true');                         // bool
$value->set('null');                         // null
$value->set('My App');                       // string
$value->set("['a', 'b']");                   // array
$value->set("env('DB_HOST', 'localhost')");  // function
$value->set("User::class");                  // class constant
```

Non-associative arrays can be written on multiple lines and still be recognized correctly. **The engine will automatically reformat them when containing five items or more**.

> [!IMPORTANT]
> Associative arrays must be created using `section()`, not `set()`.

---

## Renaming Nodes

Renaming changes the node path. When selecting again, use the new name.

```php
$file->value('connections.mysql.host')
     ->rename('hostname');

$file->value('connections.mysql.hostname');
```

## Moving and Reordering Nodes

All nodes can be reordered **within their parent scope.**

```php
$file->section('connections')->moveUp();
$file->section('connections')->moveDown();
$file->section('connections')->keepStart();
$file->section('connections')->keepEnd();
$file->section('connections')->before('redis');
$file->section('connections')->after('redis');
```

### Cross-scope movement

To move nodes outside their parent, specify the full target path.

```php
$file->section('connections')->cut('redis.options');
$file->section('connections')->copy('redis.options');
```

## Chaining & Scope Control

Selectors automatically return to the appropriate scope.

```php
$file
    ->section('connections')
        ->value('default')->set('sqlite')
        ->section('mysql')
            ->value('host')->moveUp();
```

### Root selection (`.` notation)

Using `.` always resets scope to the root file.

```php
$file
    ->section('connections')
        ->value('default', 'sqlite')
     ->section('.redis');

$file->value('connections.mysql.host');
```

## Comments Support

Comments are first-class citizens. You can add, remove, and manipulate comments in the same way as other nodes.

### Single-line comments

```php
$file->section('connections')
     ->comment('Database connections');
```

```php
'connections' => [
    // Database connections
]
```

---

### Multi-line comments

```php
$file->section('connections')
     ->comment("Line one\nLine two");
```

```php
'connections' => [
    // Line one
    // Line two
]
```

---

### Laravel-style comments

```php
$file->section('connections')
     ->comment(
         'Database connections',
         "Used by the application\nDo not edit manually"
     );
```

```php
'connections' => [

    /*
    |----------------------------------------------------
    | Database connections
    |----------------------------------------------------
    |
    | Used by the application
    | Do not edit manually
    |
    */

]
```

---

### Node-bound comments

As you can see, comments were placed **inside** the section they are created in just like other nodes.

Selecting comments can be tricky, because comments do not have keys.

More proper way to create and select comments is to bound them to other nodes. Every node may have **one associated comment, placed immediately above it.**

```php
$file->section('connections')
     ->withComment('Main database configuration'); // rich comment

$file->value('default')
     ->withComment('Default connection'); // simple comment
```

> [!IMPORTANT]
> The comment is rewritten if the node already has an associated comment. Also note that `withComment()` is just for scoping convenience. It does not make any functional difference compared to creating comments normally.

This way, comments are logically tied to their nodes, and you can rewrite them without worrying about selecting them directly.

```php
$file->section('connections')->withoutComment();
```

## Layout, Padding & Formatting

Each node defines its own **padding rules.**

The engine:

- respects indentation
- preserves spacing between nodes
- recalculates layout on every structural change
- guarantees consistent formatting

You never manually manage whitespace.

## Saving & Diffing

### Save Changes

```php
$file->save();
```

### Preview Changes

```php
$render = $file->render(); // array of lines
$diff = $file->diff();     // array-based diff
```

## Debugging & Inspection

Every node can be inspected:

```php
/**
 * Get the node array representation.
 * @return array<string, mixed>
 */
$node->toArray();

/**
 * Get the type of the node.
 *
 * @return string 'file', 'section', 'value', 'comment', 'richcomment'
 */
$node->type();
```

---

### Common Getter Methods

```php
/**
 * Get the node path.
 * @return string
 */
$node->path(): string;

/**
 * Get the node name.
 * @return string
 */
$node->name(): string;

/**
 * Get the node start line number.
 * @return int
 */
$node->start(): int;

/**
 * Get the node end line number.
 * @return int
 */
$node->end(): int;

/**
 * Get the node raw array of lines.
 * @return array<int, string>
 */
$node->raw(): array;

/**
 * Render the node to array of lines.
 * @return array<int, string>
 */
$node->render(): array;

/**
 * Get the node indentation level. (including padding)
 * @return int
 */
$node->scale(): int;

/**
 * Get the node parent instance.
 * @return ?ParentNode
 */
$node->parent(): ?ParentNode;

/**
 * Get the node siblings collection.
 * @return Collection<Node>
 */
$node->siblings(): Collection;

/**
 * Get the sibling nodes before the current node.
 * @return Collection<Node>
 */
$node->siblingsBefore(): Collection;

/**
 * Get the sibling nodes after the current node.
 * @return Collection<Node>
 */
$node->siblingsAfter(): : Collection;

/**
 * Get the root file instance.
 * @return File
 */
$node->root(): File;
```

---

### Common Helpers

```php
/** Determine if the node was created during this session. */
$node->isNew(): bool;

/** Determine if the node has unsaved changes. */
$node->isDirty(): bool;

/** Determine if the node is of a specific type. */
$node->isTypeOf(string $type): bool;

/** Determine if the node is a sub-node (not top-level). */
$node->isSubNode(): bool;

/** Determine if the node is at root top-level. */
$node->isRoot(): bool;

/** Determine if the node is the first child of its parent. */
$node->isFirstChild(): bool;

/** Determine if the node is the last child of its parent. */
$node->isLastChild(): bool;
```

---

### Value Helpers

```php
$value->isNull(): bool;
$value->isString(): bool;
$value->isNumber(): bool;
$value->isBoolean(): bool;
$value->isArray(): bool;
$value->isFunction(): bool;
$value->isClass(): bool;
```

---

### Parent Node Helpers

```php
$parent->nodes(): Collection;
```

---

### Comment Node Helpers

```php
$comment->label(): string;
$comment->setLabel(string $label): static;

// RichComment only
$comment->description(): string;
$comment->setDescription(string $body): static;
```

## License

Rosalana Configure is open-source under the [MIT license](/LICENCE), allowing you to freely use, modify, and distribute it with minimal restrictions.

You may not be able to use our systems but you can use our code to build your own.

For details on how to contribute or how the Rosalana ecosystem is maintained, please refer to each repository’s individual guidelines.

**Questions or feedback?**

Feel free to open an issue or contribute with a pull request. Happy coding with Rosalana!
