# ShieldCI Analyzers Core

Shared foundation for building static analysis tools. Includes abstract analyzer classes, result formatters, file parsers, and utilities.

[![Tests](https://github.com/shieldci/analyzers-core/actions/workflows/tests.yml/badge.svg)](https://github.com/shieldci/analyzers-core/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/shieldci/analyzers-core/branch/master/graph/badge.svg)](https://codecov.io/gh/shieldci/analyzers-core)
[![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)](https://www.php.net/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PHPStan](https://img.shields.io/badge/PHPStan-Level%209-brightgreen)](https://phpstan.org/)

## Features

- **Framework Agnostic**: Works with any PHP 8.1+ project
- **Type Safe**: Full type hints and strict typing
- **Extensible**: Easy to create custom analyzers
- **Well Tested**: Comprehensive test suite (100% coverage)
- **Modern PHP**: Uses PHP 8.1+ features
- **Laravel Compatible**: Works with Laravel 9.x, 10.x, 11.x, 12.x and 13.x

## Requirements

- PHP 8.1 or higher
- Composer

## Installation

```bash
composer require shieldci/analyzers-core
```

## Architecture

### Core Components

1. **Interfaces**
   - `AnalyzerInterface` - Contract for all analyzers
   - `ResultInterface` - Contract for analysis results
   - `ReporterInterface` - Contract for result formatters
   - `ParserInterface` - Contract for code parsers

2. **Abstract Base Classes**
   - `AbstractAnalyzer` - Base class with timing, error handling, and helper methods
   - `AbstractFileAnalyzer` - Base class for file-based analyzers with file filtering

3. **Value Objects**
   - `Location` - Represents a code location (file, line, column)
   - `Issue` - Represents a specific issue found
   - `CodeSnippet` - Represents a code snippet with context lines
   - `AnalyzerMetadata` - Metadata about an analyzer

4. **Results**
   - `AnalysisResult` - Result of running a single analyzer
   - `ResultCollection` - Collection of analysis results

5. **Utilities**
   - `AstParser` - AST parsing using nikic/php-parser
   - `FileParser` - File content parsing utilities
   - `CodeHelper` - Code analysis helpers
   - `ConfigFileHelper` - Laravel configuration file utilities
   - `MessageHelper` - Error message sanitization (redacts credentials, tokens, IPs)
   - `InlineSuppressionParser` - Parses `@shieldci-ignore` inline suppression comments

6. **Formatters**
   - `JsonFormatter` - Format results as JSON
   - `ConsoleFormatter` - Format results for console output

## Usage

### Creating a Custom Analyzer

```php
<?php

use ShieldCI\AnalyzersCore\Abstracts\AbstractFileAnalyzer;
use ShieldCI\AnalyzersCore\Contracts\ResultInterface;
use ShieldCI\AnalyzersCore\ValueObjects\AnalyzerMetadata;
use ShieldCI\AnalyzersCore\Enums\{Category, Severity};

class MySecurityAnalyzer extends AbstractFileAnalyzer
{
    protected function metadata(): AnalyzerMetadata
    {
        return new AnalyzerMetadata(
            id: 'my-security-analyzer',
            name: 'My Security Analyzer',
            description: 'Checks for security vulnerabilities',
            category: Category::Security,
            severity: Severity::High,
        );
    }

    protected function runAnalysis(): ResultInterface
    {
        $issues = [];

        foreach ($this->getPhpFiles() as $file) {
            $content = $this->readFile($file);

            // Find line number where eval() appears
            $lines = explode("\n", $content);
            foreach ($lines as $lineNum => $line) {
                if (str_contains($line, 'eval(')) {
                    $issues[] = $this->createIssueWithSnippet(
                        message: 'Dangerous eval() function found',
                        filePath: $file,
                        lineNumber: $lineNum + 1,
                        severity: Severity::Critical,
                        recommendation: 'Remove eval() and use safer alternatives',
                        metadata: ['code' => 'dangerous-eval']
                    );
                }
            }
        }

        if (empty($issues)) {
            return $this->passed('No security issues found');
        }

        return $this->failed(
            'Security issues detected',
            $issues,
            ['files_scanned' => count($this->getPhpFiles())]
        );
    }
}
```

### Running an Analyzer

```php
<?php

$analyzer = new MySecurityAnalyzer();
$analyzer->setBasePath('/path/to/project');
$analyzer->setPaths(['src', 'app']);

$result = $analyzer->analyze();

echo "Status: " . $result->getStatus()->value . PHP_EOL;
echo "Message: " . $result->getMessage() . PHP_EOL;
echo "Issues: " . count($result->getIssues()) . PHP_EOL;
```

### Using Result Collection

```php
<?php

use ShieldCI\AnalyzersCore\Results\ResultCollection;

$collection = new ResultCollection();
$collection->add($analyzer1->analyze());
$collection->add($analyzer2->analyze());
$collection->add($analyzer3->analyze());

echo "Score: " . $collection->score() . "%" . PHP_EOL;
echo "Total Issues: " . $collection->totalIssues() . PHP_EOL;
echo "Execution Time: " . $collection->totalExecutionTime() . "s" . PHP_EOL;
```

### Formatting Results

```php
<?php

use ShieldCI\AnalyzersCore\Formatters\{ConsoleFormatter, JsonFormatter};

$results = [$result1, $result2, $result3];

// Console output
$consoleFormatter = new ConsoleFormatter(useColors: true, verbose: true);
echo $consoleFormatter->format($results);

// JSON output
$jsonFormatter = new JsonFormatter(prettyPrint: true);
$json = $jsonFormatter->format($results);
file_put_contents('report.json', $json);
```

### Using the AST Parser

```php
<?php

use ShieldCI\AnalyzersCore\Support\AstParser;
use PhpParser\Node\Expr\MethodCall;

$parser = new AstParser();
$ast = $parser->parseFile('/path/to/file.php');

// Find all method calls
$methodCalls = $parser->findMethodCalls($ast, 'query');

// Find static calls
$staticCalls = $parser->findStaticCalls($ast, 'DB', 'raw');

// Find nodes of specific type
$classes = $parser->findNodes($ast, \PhpParser\Node\Stmt\Class_::class);

// Resolve fully-qualified class names with NameResolver
// After this, use $node->getAttribute('resolvedName') on Name nodes to get FQCNs
$resolvedAst = $parser->resolveNames($ast);

// With options — preserve original Name nodes, set only the 'resolvedName' attribute
$resolvedAst = $parser->resolveNames($ast, ['replaceNodes' => false]);
$fqcn = $someNameNode->getAttribute('resolvedName')?->toString(); // e.g. 'Illuminate\Database\Eloquent\Model'
```

### Using Code Helpers

```php
<?php

use ShieldCI\AnalyzersCore\Support\CodeHelper;

$code = file_get_contents('/path/to/file.php');

// Calculate complexity
$complexity = CodeHelper::calculateComplexity($code);

// Find dangerous functions
$dangerous = CodeHelper::findDangerousFunctions($code);

// Check if looks like SQL
$isSql = CodeHelper::looksLikeSql($string);

// Validate naming conventions
$isValid = CodeHelper::isValidClassName('MyClass');
```

### Using Code Snippets

The `CodeSnippet` value object provides rich code context for issues with several advanced features:

```php
<?php

use ShieldCI\AnalyzersCore\ValueObjects\CodeSnippet;

// Create a code snippet from a file
$snippet = CodeSnippet::fromFile(
    filePath: '/path/to/file.php',
    targetLine: 42,
    contextLines: 8  // Lines before/after to show (default: 8)
);

if ($snippet !== null) {
    // Get the lines with line numbers as keys
    $lines = $snippet->getLines();

    // Get the target line number
    $targetLine = $snippet->getTargetLine();

    // Get file path
    $filePath = $snippet->getFilePath();

    // Convert to array for serialization
    $array = $snippet->toArray();
}
```

**Advanced Features:**

1. **Smart Context Expansion**
   - Automatically detects method/class signatures above the target line
   - Expands context to include signature if within 15 lines
   - Provides crucial context for understanding where issues occur
   - Detects: classes, interfaces, traits, enums, public/protected/private methods

2. **Configurable Context**
   - Default: 8 lines before and after target line
   - Customizable via `contextLines` parameter
   - Automatically handles file boundaries

3. **Line Truncation**
   - Truncates long lines to 250 characters to prevent terminal wrapping
   - Preserves readability in console output

4. **Null Safety**
   - Returns `null` if file doesn't exist or can't be read
   - Graceful error handling for runtime exceptions

**Example with Issue:**

```php
<?php

use ShieldCI\AnalyzersCore\ValueObjects\{Issue, Location, CodeSnippet};
use ShieldCI\AnalyzersCore\Enums\Severity;

$issue = new Issue(
    message: 'Hardcoded credentials detected',
    location: new Location('/path/to/file.php', 42),
    severity: Severity::Critical,
    recommendation: 'Move credentials to environment variables',
    metadata: ['type' => 'password', 'code' => 'hardcoded-credentials'],
    codeSnippet: CodeSnippet::fromFile('/path/to/file.php', 42)
);

// The code snippet is displayed in verbose console output with:
// - Line numbers alongside each line
// - "→" prefix on the target line, "  " prefix on context lines
// - Indentation preserved (trailing whitespace stripped, leading kept)
```

**Smart Context Expansion Example:**

```php
// Given this code:
// Line 35: public function processPayment($amount)
// Line 36: {
// Line 37:     // validation
// Line 38:     // ...
// Line 42:     $hardcodedKey = 'secret123';  // ← Issue here
// Line 43: }

// Even though line 35 is normally outside the 8-line context window,
// CodeSnippet automatically includes it because it's the method signature
$snippet = CodeSnippet::fromFile('/path/to/file.php', 42);

// Result includes lines 35-50 (method signature + context)
// instead of just lines 34-50
```

### Using Config File Helper

The `ConfigFileHelper` utility provides powerful methods for working with Laravel configuration files, particularly useful for analyzers that need to report issues in config files with precise line numbers.

```php
<?php

use ShieldCI\AnalyzersCore\Support\ConfigFileHelper;

// Get the path to a config file
$configPath = ConfigFileHelper::getConfigPath(
    basePath: '/path/to/project',
    file: 'database',  // with or without .php extension
    fallback: fn($file) => config_path($file)  // Optional Laravel helper fallback
);
// Result: /path/to/project/config/database.php

// Find the line number where a specific key is defined
$lineNumber = ConfigFileHelper::findKeyLine(
    configFile: '/path/to/project/config/database.php',
    key: 'default'
);
// Returns the line number (1-indexed) where 'default' => is defined

// Find a key within a parent array
$lineNumber = ConfigFileHelper::findKeyLine(
    configFile: '/path/to/project/config/database.php',
    key: 'driver',
    parentKey: 'connections'  // Search within 'connections' array
);
// Returns the line number where 'driver' => is defined within 'connections'

// Find a nested key within a specific array item
$lineNumber = ConfigFileHelper::findNestedKeyLine(
    configFile: '/path/to/project/config/cache.php',
    parentKey: 'stores',
    nestedKey: 'driver',
    nestedValue: 'redis'  // Search within 'redis' store configuration
);
// Returns the line number where 'driver' => is defined
// within the 'redis' item in the 'stores' array
```

**Advanced Features:**

1. **Comment-Aware Searching**
   - Automatically strips single-line comments (`//`, `#`)
   - Avoids false positives from commented-out config

2. **Precise Pattern Matching**
   - Uses regex to match exact array key patterns: `'key' =>` or `"key" =>`
   - Handles various spacing: `'key'=>` or `'key' =>`
   - Avoids matching keys in string values or comments

3. **Nested Array Navigation**
   - Can search within parent arrays using `parentKey` parameter
   - Detects when entering/exiting parent array boundaries
   - Handles nested array structures like connections, stores, etc.

4. **Smart Indentation Detection**
   - Uses indentation level to determine array nesting
   - Stops searching when encountering top-level keys outside target scope
   - Prevents false matches in unrelated config sections

5. **Fallback Support**
   - Returns line 1 if key not found (safe default)
   - Supports optional Laravel `config_path()` fallback for non-Laravel environments

**Use Cases:**

- **Database Analyzers**: Find connection settings, driver configurations
- **Cache Analyzers**: Locate cache store configurations, driver settings
- **Session Analyzers**: Find session driver, lifetime, security settings
- **Queue Analyzers**: Locate queue connection, driver configurations
- **Mail Analyzers**: Find mail driver, encryption settings

### Parsing Config Arrays

`ConfigFileHelper::parseConfigArray()` parses a PHP config file that returns an array and extracts the top-level key–value pairs via AST — no regex, no fragile text matching.

```php
<?php

use ShieldCI\AnalyzersCore\Support\ConfigFileHelper;

$entries = ConfigFileHelper::parseConfigArray('/path/to/config/session.php');

// Each entry has: value, line, isEnvCall, envDefault, envHasDefault
foreach ($entries as $key => $entry) {
    echo "{$key} on line {$entry['line']}: ";

    if ($entry['isEnvCall']) {
        // Value comes from env() at runtime
        echo "env() call";
        if ($entry['envHasDefault']) {
            var_dump($entry['envDefault']); // The default argument value
        }
    } else {
        var_dump($entry['value']); // Literal: string, int, float, bool, or null
    }
}
```

**Example — checking session cookie security:**

```php
$session = ConfigFileHelper::parseConfigArray($configPath);

// Resolve the effective value (literal or env() default)
$secure = $session['secure']['isEnvCall']
    ? $session['secure']['envDefault']
    : $session['secure']['value'];

if ($secure !== true) {
    $issues[] = $this->createIssueWithSnippet(
        message: 'Session cookies are not marked secure',
        filePath: $configPath,
        lineNumber: $session['secure']['line'],
        severity: Severity::High,
        recommendation: 'Set SESSION_SECURE_COOKIE=true in production',
    );
}
```

**Supported value types:**

| PHP Source | `value` |
|---|---|
| `'string'` | `'string'` |
| `42` / `3.14` | `42` / `3.14` |
| `true` / `false` / `null` | `true` / `false` / `null` |
| `PHP_INT_MAX` (constant) | `'PHP_INT_MAX'` (string) |
| `env('KEY')` | `null` (isEnvCall = true) |
| `env('KEY', 'default')` | `null` (envDefault = `'default'`) |
| `['nested', 'array']` | `null` (complex, not extracted) |

### Stripping PHP Comments

`FileParser::stripAllComments()` removes all PHP comment styles from source code using the tokenizer — correctly handling comments inside strings, URLs, docblocks, and multiline blocks.

```php
<?php

use ShieldCI\AnalyzersCore\Support\FileParser;

$code = file_get_contents('/path/to/file.php');

// Strips //, #, /* */, and /** */ comments
// Preserves line numbering (removed lines replaced with blank lines)
// Safe for URLs in strings: "https://example.com" is NOT stripped
$stripped = FileParser::stripAllComments($code);
```

Unlike `FileParser::stripComments()` (which works on single lines via regex and breaks on URLs), `stripAllComments()` uses `token_get_all()` and handles arbitrary PHP source correctly.

### Sanitizing Error Messages

`MessageHelper::sanitizeErrorMessage()` redacts sensitive values from error messages before they appear in analyzer recommendations — preventing credentials and tokens from leaking into reports.

```php
<?php

use ShieldCI\AnalyzersCore\Support\MessageHelper;

// Redacts: passwords, API keys, bearer tokens, AWS keys, internal IPs (10.x, 172.x, 192.168.x)
$safe = MessageHelper::sanitizeErrorMessage(
    'Connection failed: password=s3cr3t host=10.0.0.5'
);
// → 'Connection failed: password=[REDACTED] host=[INTERNAL_IP]'

// Use in analyzer recommendations:
$issues[] = $this->createIssue(
    message: 'Redis connection failed',
    location: null,
    severity: Severity::High,
    recommendation: MessageHelper::sanitizeErrorMessage($e->getMessage()),
);
```

**Redacted patterns:**

| Pattern | Replacement |
|---|---|
| `password=…`, `passwd=…`, `pwd=…` | `[REDACTED]` |
| `api_key=…`, `apikey=…`, `secret=…` | `[REDACTED]` |
| `Bearer <token>` | `Bearer [REDACTED]` |
| `AKIA…` (AWS access key) | `[REDACTED]` |
| `10.x.x.x`, `172.16–31.x.x`, `192.168.x.x` | `[INTERNAL_IP]` |

### Parsing Inline Suppressions

`InlineSuppressionParser` parses `// @shieldci-ignore` comments to determine whether a given line should suppress a specific analyzer rule.

```php
<?php

use ShieldCI\AnalyzersCore\Support\InlineSuppressionParser;

$parser = new InlineSuppressionParser();
$lines  = file('/path/to/file.php', FILE_IGNORE_NEW_LINES);

// Returns true if the line (or an adjacent suppression comment) suppresses $analyzerId
$suppressed = $parser->isLineSuppressed($lines, $lineNumber, 'sql-injection');

if (! $suppressed) {
    $issues[] = $this->createIssueWithSnippet(/* … */);
}
```

**Supported suppression styles:**

```php
// Same-line:
$query = $db->raw($input); // @shieldci-ignore sql-injection

// Previous-line:
// @shieldci-ignore sql-injection
$query = $db->raw($input);

// Suppress multiple rules:
// @shieldci-ignore sql-injection, xss
echo $userInput;

// Suppress all rules on a line:
// @shieldci-ignore
echo $trustedContent;

/**
 * @shieldci-ignore sql-injection
 */
$query = $db->raw($input);
```

## Enums

ShieldCI Analyzers Core provides three powerful enums with rich helper methods for better developer experience.

### Status

Represents the result status of an analyzer execution.

**Cases:**
- `Status::Passed` - Analysis completed successfully with no issues
- `Status::Failed` - Analysis found critical issues that need fixing
- `Status::Warning` - Analysis found warnings that should be reviewed
- `Status::Skipped` - Analysis was skipped (not applicable)
- `Status::Error` - Analysis encountered an error during execution

### Category

Represents the category/type of an analyzer.

**Cases:**
- `Category::Security` - Security vulnerabilities and risks (🔒)
- `Category::Performance` - Performance issues and optimizations (⚡)
- `Category::CodeQuality` - Code quality and maintainability (📊)
- `Category::BestPractices` - Best practices and conventions (✨)
- `Category::Reliability` - Reliability and stability issues (🛡️)

### Severity

Represents the severity level of an issue.

**Cases:**
- `Severity::Critical` - Critical security or stability issue requiring immediate attention
- `Severity::High` - High priority issue that should be addressed soon
- `Severity::Medium` - Medium priority issue that should be considered
- `Severity::Low` - Low priority issue or minor improvement
- `Severity::Info` - Informational message or suggestion

## Testing

```bash
# Run tests
composer test

# Run tests with coverage
composer test-coverage

# Run static analysis
composer analyse

# Format code
composer format
```

## Directory Structure

```
src/
├── Contracts/          # Interfaces
├── Abstracts/          # Abstract base classes
├── Enums/             # Enum types
├── ValueObjects/      # Immutable value objects
├── Results/           # Result classes
├── Support/           # Utility classes
└── Formatters/        # Result formatters

tests/
├── Unit/              # Unit tests
```

## Used By

- [shieldci/laravel](https://github.com/shieldci/laravel) - Free Laravel analyzer package
- [shieldci/laravel-pro](https://github.com/shieldci/laravel-pro) - Pro Laravel analyzer package

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License. See LICENSE file for details.

## Credits

Built by the ShieldCI team.
