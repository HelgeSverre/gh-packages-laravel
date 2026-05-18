# Laravel AGL (Agentic Governance Layer)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/apurba-labs/laravel-agl.svg?style=flat-square)](https://packagist.org/packages/apurba-labs/laravel-agl)
[![Total Downloads](https://img.shields.io/packagist/dt/apurba-labs/laravel-agl.svg?style=flat-square)](https://packagist.org/packages/apurba-labs/laravel-agl)

Laravel AGL is a governance-first framework for building AI-assisted workflows in Laravel applications.

It helps developers add:

* AI reasoning pipelines
* policy enforcement
* human approval flows
* risk scoring
* governance audit trails

to applications powered by Gemma, Ollama, or other LLMs.

Built for:

* enterprise approval systems
* institutional workflows
* compliance-sensitive applications
* local/private AI deployments

---

# Why Laravel AGL?

Most AI integrations focus only on generation.

Laravel AGL focuses on governance.

Instead of allowing agents to operate without boundaries, Laravel AGL introduces:

* policy-aware reasoning
* approval escalation
* audit visibility
* risk-aware execution

This enables organizations to safely integrate AI into sensitive workflows.

---

# Features

* Local AI reasoning support
* Policy-based workflow enforcement
* Human-in-the-loop escalation
* Risk scoring pipelines
* Governance audit logging
* Laravel-native developer experience
* Midnight ZK-proof integration hooks

---

# Installation

```bash
composer require apurba-labs/laravel-agl
```

---

# Quick Start

```php
use ApurbaLabs\Agl\Facades\AGL;

$result = AGL::policy('alumni-verification')
    ->requireZkProof()
    ->evaluate([
        'name' => 'John Doe',
        'graduation_year' => 2010,
    ]);

if ($result['approved']) {
    // Continue workflow
}
```

---

# Example Use Cases

* Alumni verification systems
* AI-assisted approval workflows
* NGO transparency platforms
* Financial governance pipelines
* Internal compliance systems

---

# Philosophy

Laravel AGL is built around a simple principle:

> “AI can recommend. Governance decides.”

---

# Related Projects


| Project | Purpose |
| :--- | :--- |
| [`gotihub-agl`](https://github.com/apurba-labs/laravel-agl) | Full governance platform |
| [`gotihub-midnight-bridge`](https://github.com/apurba-labs/laravel-iam) | Midnight ZK-proof integration |
| [`laravel-iam`](https://github.com/apurba-labs/gotihub-midnight-bridge) | Identity & role governance |
| [`laravel-approval-engine`](https://github.com/apurba-labs/laravel-approval-engine) | Approval Workflow Engine |


---

# License

MIT License
