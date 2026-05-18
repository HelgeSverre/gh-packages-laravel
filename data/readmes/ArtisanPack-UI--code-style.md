# ArtisanPack UI Code Standards

A custom PHP code style standard based on PHPStorm settings. This package provides custom sniffs for PHP_CodeSniffer that enforce consistent code style across your PHP projects.

## Installation

You can install the ArtisanPack UI Code Standards package by running the following composer command:

```bash
composer require artisanpack-ui/code-style --dev
```

## Usage

### Configuration

After installation, you can create a `phpcs.xml` file in your project root with the following content:

```xml
<?xml version="1.0"?>
<ruleset name="YourProjectStandard">
    <description>Your project's coding standard</description>

    <!-- Use ArtisanPackUI standard -->
    <rule ref="ArtisanPackUIStandard"/>

    <!-- Specify paths to check -->
    <file>app</file>
    <file>src</file>
    <file>tests</file>

    <!-- Exclude paths -->
    <exclude-pattern>*/vendor/*</exclude-pattern>
    <exclude-pattern>*/node_modules/*</exclude-pattern>
</ruleset>
```

### Running PHP_CodeSniffer

You can run PHP_CodeSniffer with the ArtisanPackUI standard using the following command:

```bash
./vendor/bin/phpcs --standard=ArtisanPackUIStandard .
```

Or if you've set up a custom `phpcs.xml` file:

```bash
./vendor/bin/phpcs
```

### Custom Sniffs

This package includes 16+ custom sniffs covering:

- **Formatting**: Indentation, braces, spacing, alignment
- **Code Structure**: Classes, control structures, imports, arrays
- **Naming Conventions**: PascalCase for classes, camelCase for functions/variables, snake_case for table columns
- **Security**: Input validation, output escaping (see [Security Sniffs](docs/sniffs/security-sniffs))
- **Best Practices**: Yoda conditionals, type declarations, disallowed functions

For complete details on all sniffs with examples, see the [Custom Sniffs Reference](docs/sniffs/sniffs).

### Customizing Sniffs

You can customize the behavior of the sniffs by overriding their properties in your `phpcs.xml` file:

```xml
<rule ref="ArtisanPackUI.Formatting.Indentation">
    <properties>
        <property name="indent" value="2"/>
    </properties>
</rule>
```

## Documentation

📚 **[Complete Documentation](docs/home)** - Comprehensive guides and references

### Quick Links
- **[Installation Guide](docs/installation)** - Detailed installation instructions
- **[Usage Guide](docs/usage/usage)** - Basic usage and IDE integration
- **[Troubleshooting](docs/troubleshooting)** - Common issues and solutions
- **[Customization Guide](docs/customization/customization)** - How to customize sniffs
- **[All Sniffs Reference](docs/sniffs/sniffs)** - Complete sniff documentation
- **[Security Sniffs](docs/sniffs/security-sniffs)** - Security-focused sniffs

## Contributing

🤝 **[Contributing Guidelines](docs/contributing/contributing)** - How to contribute to the project

As an open source project, this package is open to contributions from anyone. Whether you want to report bugs, suggest features, improve documentation, or contribute code, please read through our comprehensive contributing guidelines.

### Additional Resources
- **[AI Guidelines](docs/contributing/ai-guidelines)** - Guidelines for AI-assisted development
- **[Code of Conduct](docs/contributing/contributing#code-of-conduct)** - Community standards
