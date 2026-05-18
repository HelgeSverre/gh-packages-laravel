[![Latest Stable Version](https://img.shields.io/packagist/v/jbsommeling/scannr.svg)](https://packagist.org/packages/jbsommeling/scannr)
[![Total Downloads](https://img.shields.io/packagist/dt/jbsommeling/scannr.svg)](https://packagist.org/packages/jbsommeling/scannr)
[![Tests](https://img.shields.io/github/actions/workflow/status/JBSommeling/scannr/tests.yml?label=tests)](https://github.com/JBSommeling/scannr/actions)
[![License](https://img.shields.io/packagist/l/jbsommeling/scannr.svg)](https://packagist.org/packages/jbsommeling/scannr)
[![PHP Version Require](https://img.shields.io/packagist/dependency-v/jbsommeling/scannr/php)](https://packagist.org/packages/jbsommeling/scannr)
[![Code Size](https://img.shields.io/github/languages/code-size/JBSommeling/scannr)](https://github.com/JBSommeling/scannr)
[![GitHub stars](https://img.shields.io/github/stars/JBSommeling/scannr.svg)](https://github.com/JBSommeling/scannr/stargazers)

# Scannr

A Laravel package that crawls websites to detect broken links, redirect chains, HTTPS downgrades, and more. Includes JavaScript rendering support for SPAs. Use it as a **dev dependency** in your Laravel project or as a **Docker-based GitHub Action** in your CI/CD pipeline.

## Features

- **BFS Crawling** — Systematically crawls websites level by level
- **Broken Link Detection** — Identifies links returning 4xx/5xx status codes
- **Multi-Element Scanning** — Extracts URLs from `<a>`, `<link>`, `<script>`, `<img>`, media elements, download triggers, and inline JS handlers
- **JavaScript Rendering** — Scan SPAs (React, Vue, Angular) with headless browser support via `--js` flag
- **Smart JS Detection** — Automatically detect SPAs and enable JS rendering only when needed via `--smart-js` flag
- **Sitemap Integration** — Discover URLs from XML, HTML, or plain text sitemaps (including sitemap index files)
- **robots.txt Support** — Respects `Disallow` rules and `Crawl-delay` directives
- **Redirect Chain Tracking** — Follows and reports redirect chains, including loop detection
- **HTTPS Downgrade Detection** — Warns when redirects downgrade from HTTPS to HTTP
- **Link Flag System** — Every link is tagged with observation flags (discovery method, platform traits, technical anomalies, validation outcome)
- **Integrity Scoring** — Weight-based scoring model that rates your site's link health (A–F)
- **Quality Gates** — Fail CI/CD when critical issues are found or the integrity score drops below a configurable threshold
- **Rate Limit Backoff** — Automatic exponential backoff on HTTP 429 responses
- **Noise URL Filtering** — Hides XML namespaces, CDN preconnect hints, and JS framework error docs
- **Multiple Output Formats** — Table, JSON, or CSV output
- **Domain Validation** — Warns when the scanned URL doesn't match your `APP_URL`

## Responsible Use

Scannr is intended for scanning websites you own or have explicit permission to test.

Users are responsible for ensuring their usage complies with:
- Website terms of service
- Applicable laws and regulations
- robots.txt directives

Do not use Scannr to:
- Crawl websites without permission
- Overload servers or bypass rate limits
- Access protected or private content

The authors are not responsible for misuse of this tool.

---

## Installation

### As a Laravel Dev Dependency

```bash
composer require jbsommeling/scannr
```

The package auto-discovers its service provider. To publish the configuration:

```bash
php artisan vendor:publish --tag=scannr-config
```

To publish the migration (for `--queue` support):

```bash
php artisan vendor:publish --tag=scannr-migrations
php artisan migrate
```

### JavaScript Rendering (Optional)

For `--js` and `--smart-js` support, install Puppeteer:

```bash
npm install puppeteer
```

---

## CLI Usage

### Basic Scan

```bash
php artisan site:scan https://example.com
```

### Command Signature

```
php artisan site:scan {url} [options]
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--depth=N` | 3 | Maximum crawl depth from the starting URL |
| `--max=N` | 300 | Maximum number of URLs to scan |
| `--timeout=N` | 5 | Request timeout in seconds |
| `--format=FORMAT` | table | Output format: `table`, `json`, or `csv` |
| `--status=FILTER` | all | Filter results: `all`, `ok`, or `broken` |
| `--filter=TYPE` | all | Filter by element type: `all`, `a`, `link`, `script`, `img`, `media`, `form` |
| `--scan-elements=TYPES` | all | Element types to scan: `all`, or comma-separated (e.g., `a,img`) |
| `--sitemap` | false | Use sitemap.xml to discover URLs before crawling |
| `--js` | false | Enable JavaScript rendering for SPA/React sites |
| `--smart-js` | false | Auto-detect SPAs and enable JS rendering when needed |
| `--no-robots` | false | Ignore robots.txt rules |
| `--advanced` | false | Show noise URLs (XML namespaces, CDN hints, etc.) |
| `--strip-params=PARAMS` | — | Additional tracking parameters to strip (comma-separated) |
| `--delay-min=N` | config | Minimum delay between requests in milliseconds |
| `--delay-max=N` | config | Maximum delay between requests in milliseconds |
| `--queue` | false | Dispatch scan as a background job |
| `--fail-on-critical` | false | Fail with exit code 1 if critical issues are found |
| `--min-rating=GRADE` | none | Minimum acceptable rating: `excellent`, `good`, `needs_attention`, `none` |

### Examples

```bash
# Show only broken links
php artisan site:scan https://example.com --status=broken

# Deep scan with sitemap discovery
php artisan site:scan https://example.com --depth=5 --max=1000 --sitemap

# Scan a React SPA with JSON output
php artisan site:scan https://my-spa.com --js --format=json

# Only scan images and anchors
php artisan site:scan https://example.com --scan-elements=a,img --status=broken

# Throttle requests (200–500ms random delay between each request)
php artisan site:scan https://example.com --delay-min=200 --delay-max=500

# Fail if any critical issues found or rating drops below "Good"
php artisan site:scan https://example.com --fail-on-critical --min-rating=good

# Strict quality gate: require "Excellent" rating
php artisan site:scan https://example.com --fail-on-critical --min-rating=excellent
```

### Example Output

#### Table (default)

```
Site Scan: https://www.example.com
========================================

  Robots.txt Crawl-delay: 1s (using 1000ms-1000ms delay)
  Robots.txt: respecting 4 Disallow/Allow rule(s)
 11/30 [▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░]  36% 30/30 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%


  🟢 Site Integrity Score: 100.0 / 100  —  Excellent

    Link Integrity:        100.0 / 100
    Security Hygiene:      100.0 / 100
    Technical Hygiene:     100.0 / 100
    Redirect Health:       100.0 / 100
    Link Verifiability:    100.0 / 100

  Critical Issues:       0
  Broken Links:          0
  Warnings:              0
  Manual Verification:   0

Summary:
  Total scanned:     11
  Pages scanned:     2
  Internal links:    1
  Assets scanned:    9
  External links:    1
  Working (2xx):     11
  Redirects:         0
  Broken:            0
  Timeouts:          0

+----------------------------------------------+--------------------------+----------+--------+----------+
| URL                                          | Source                   | Element  | Status | Type     |
+----------------------------------------------+--------------------------+----------+--------+----------+
| https://www.example.com                      | start                    | <a>      | 200    | internal |
| https://example.com/favicon.svg              | https://www.example.com  | <link>   | 200    | internal |
| https://example.com/favicon.ico              | https://www.example.com  | <link>   | 200    | internal |
| https://example.com/assets/app-Dk29a1xC.css  | https://www.example.com  | <link>   | 200    | internal |
| https://example.com/assets/app-Bx7L3f2q.js   | https://www.example.com  | <script> | 200    | internal |
| https://fonts.googleapis.com/css2?family=... | https://www.example.com  | <link>   | 200    | external |
+----------------------------------------------+--------------------------+----------+--------+----------+
```

#### JSON (`--format=json`)

```json
{
    "summary": {
        "totalScanned": 8,
        "ok": 8,
        "redirects": 0,
        "broken": 0,
        "timeouts": 0,
        "redirectChainCount": 0,
        "totalRedirectHops": 0,
        "httpsDowngrades": 0,
        "criticalCount": 0,
        "warningCount": 0,
        "lowConfidenceCount": 0,
        "pagesScanned": 2,
        "internalLinks": 1,
        "assetsScanned": 6,
        "externalLinks": 1
    },
    "integrityScore": {
        "overallScore": 100,
        "grade": "Excellent",
        "components": {
            "linkIntegrity": 100,
            "securityHygiene": 100,
            "technicalHygiene": 100,
            "redirectHealth": 100,
            "linkVerifiability": 100
        }
    },
    "links": [
        {
            "url": "https://www.example.com",
            "sourcePage": "start",
            "status": "200",
            "type": "internal",
            "sourceElement": "a",
            "analysis": {
                "flags": [],
                "severity": "info",
                "confidence": "high",
                "verification": "none"
            },
            "redirect": {
                "chain": [],
                "isLoop": false,
                "hasHttpsDowngrade": false
            },
            "network": {
                "retryAfter": null
            }
        }
    ],
    "brokenLinks": []
}
```

---

## GitHub Action

Use Scannr in your CI/CD pipeline to catch broken links on every deploy.

### Basic Usage

```yaml
name: Scan for broken links
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: JBSommeling/scannr@v1
        with:
          url: https://example.com
```

### All Options

```yaml
- uses: JBSommeling/scannr@v1
  with:
    url: https://example.com       # Required
    depth: 5                        # Max crawl depth (default: 3)
    max: 500                        # Max URLs to scan (default: 300)
    timeout: 10                     # Request timeout in seconds (default: 5)
    format: table                   # Output: table, json, csv (default: table)
    status: broken                  # Filter: all, ok, broken (default: all)
    filter: all                     # Element type filter (default: all)
    scan-elements: a,img            # Elements to scan (default: all)
    sitemap: true                   # Use sitemap.xml (default: false)
    js: true                        # JS rendering for SPAs (default: false)
    smart-js: true                  # Auto-detect SPAs (default: false)
    no-robots: false                # Ignore robots.txt (default: false)
    advanced: false                 # Show noise URLs (default: false)
    strip-params: ref,tracker       # Extra tracking params to strip
    delay-min: 200                  # Min delay between requests in ms
    delay-max: 500                  # Max delay between requests in ms
    fail-on-broken: true            # Fail step on broken links (default: true)
    fail-on-critical: true          # Fail step on critical issues (default: true)
    min-rating: good                # Minimum integrity rating (default: good)
```

### Examples

**Scan a SPA with JavaScript rendering:**

```yaml
- uses: JBSommeling/scannr@v1
  with:
    url: https://my-react-app.com
    js: true
    status: broken
```

**Get JSON output for downstream processing:**

```yaml
- uses: JBSommeling/scannr@v1
  id: scan
  with:
    url: https://example.com
    format: json
    fail-on-broken: false

- name: Process results
  if: steps.scan.outputs.exit-code != '0'
  run: echo "Broken links detected!"
```

**Deep weekly audit with sitemap:**

```yaml
- uses: JBSommeling/scannr@v1
  with:
    url: https://example.com
    depth: 5
    max: 1000
    sitemap: true
    smart-js: true
```

**Quality gate — require "Excellent" rating:**

```yaml
- uses: JBSommeling/scannr@v1
  with:
    url: https://example.com
    fail-on-critical: true
    min-rating: excellent
```

**Relaxed quality gate — only fail on critical issues:**

```yaml
- uses: JBSommeling/scannr@v1
  with:
    url: https://example.com
    fail-on-critical: true
    min-rating: none
```

---

## URL Restriction

Scannr is designed for scanning **your own websites**, not arbitrary third-party sites.

### Local Dev Dependency

When running via `php artisan site:scan`, Scannr compares the scan URL's domain against your `APP_URL` environment variable. If they don't match, a warning is displayed:

```
⚠ The scan URL domain (other-site.com) does not match your APP_URL (https://myapp.com).
  Scannr is intended for scanning your own websites.
```

### GitHub Action (.scannr.yml)

In CI/CD, you can create a `.scannr.yml` file in your repository root to declare which domains are allowed:

```yaml
# .scannr.yml
allowed_domains:
  - example.com
  - staging.example.com
  - www.example.com
```

When `.scannr.yml` is present, the GitHub Action will **block** scans of URLs that don't match any listed domain.

If no `.scannr.yml` exists, the URL input is trusted (since you control your own workflow file).

---

## Configuration

Publish the config file to customize scanner behavior:

```bash
php artisan vendor:publish --tag=scannr-config
```

This creates `config/scannr.php` with settings for:

- **Tracking Parameters** — URL params to strip during normalization (utm_*, fbclid, etc.)
- **User Agent** — The User-Agent header sent with requests
- **Rate Limiting** — Delay between requests, backoff on 429 responses
- **Hard Limits** — Maximum caps for depth and URL count
- **JavaScript Rendering** — Custom paths to Node, npm, and Chrome binaries
- **Noise URL Detection** — Namespace domains, preconnect hints, framework error patterns
- **Integrity Scoring** — Penalty weights, confidence multipliers, grade thresholds
- **External Platforms** — Domains with known bot protection (LinkedIn, GitHub, etc.)

---

## Testing

```bash
composer test
```

---

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

