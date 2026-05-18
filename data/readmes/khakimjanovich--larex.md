# Larex

> Structured software delivery engine for Laravel and PHP

[![PHP](https://img.shields.io/badge/PHP-8.4%2B-777BB4?logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-13%2B-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![Tests](https://img.shields.io/badge/tests-40%20passing-brightgreen)](https://github.com/khakimjanovich/larex/actions)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Larex is the layer between a human requirement and a verified codebase change.

You write a GitHub milestone. Larex reads your codebase, loads project memory, reasons about the architecture, audits risk, proposes a concrete patch plan, waits for your approval of the exact plan, applies it, runs your tests, and stores what it learned — all through a pipeline where every step produces a typed, evidence-backed artifact.

**Nothing is written to your codebase until you approve the exact patch plan hash.**

![Larex Demo](demo/demo.gif)

---

## The problem

Most AI coding tools go straight from prompt to code. That works for small scripts. It breaks on real codebases — wrong abstractions, missed conventions, no audit trail, no way to say no before the damage is done.

Larex puts a structured pipeline between the idea and the implementation. Every stage has a typed contract. Every artifact is evidence-backed. The human controls the approval gate.

---

## Pipeline

```
GitHub Milestone (human-written requirement)
  │
  ├─ RequirementIntakeStage   → RequirementBrief
  ├─ MemoryHydrationStage     → load .larex/memory/ into context
  ├─ ProjectContextStage      → TargetProjectFacts + codebase snapshot
  ├─ ArchitectStage           → ArchitecturePlan
  │
  ├─ RiskAuditStage           → RiskReport
  │    └─ unsafe? ────────────────────────────────────────┐
  │                                                        │
  ├─ PatchPlanStage           → PatchPlan + PatchPlanHash  │
  │                                                        │
  ├─ ApprovalGateStage        ← human approves exact hash  │
  │    └─ rejected? ───────────────────────────────────────┘
  │                                                        │
  ├─ PatchApplyStage          → apply mutations to target  │
  │                                                        │
  ├─ VerifyStage              → run tests + static analysis│
  │    └─ failed? ─────────────────────────────────────────┘
  │         (failures attached as evidence to next plan)
  │
  ├─ ReportStage              → run-report-v1 + diff summary
  └─ MemoryUpdateStage        → update .larex/memory/
```

Every stage result carries: `status` (succeeded / failed / blocked), typed `payload`, `evidence_refs`, `warnings`, and `errors`. Non-recoverable failures stop the pipeline. Recoverable failures loop back to `ArchitectStage` with failures as evidence.

---

## Current capabilities

| Stage | Status |
|---|---|
| Detect Laravel apps, Laravel packages, PHP packages | ✅ Shipped |
| Import GitHub milestones as RequirementBrief | ✅ Shipped |
| Read and search target project source files | ✅ Shipped |
| Produce AI-backed ArchitecturePlan (Anthropic) | ✅ Shipped |
| Store pipeline run artifacts (RunStore) | ✅ Shipped |
| PatchWorker — apply mutations to target project | ✅ Shipped |
| Wire stages to StageContract / PipelineRunner | 🔄 In progress |
| MemoryHydrationStage — load project memory | 🔄 In progress |
| ProjectContextStage — formal pipeline stage | 🔄 In progress |
| `larex:plan` end-to-end command | 🔄 In progress |
| RiskAuditStage → RiskReport | 📋 Planned |
| PatchPlanStage → PatchPlan + PatchPlanHash | 📋 Planned |
| ApprovalGateStage + `larex:approve` command | 📋 Planned |
| PatchApplyStage (pipeline stage) | 📋 Planned |
| VerifyStage — run tests, static analysis | 📋 Planned |
| ReportStage — artifacts + diff summary | 📋 Planned |
| MemoryUpdateStage — update project memory | 📋 Planned |
| Feedback loops (risk redesign, approval rejection, verify failure) | 📋 Planned |

---

## Usage today

```bash
# Inspect a target project — detect type, extract facts
php artisan larex:inspect --project=/path/to/my-laravel-app

# Import a GitHub milestone as a structured requirement brief
php artisan larex:milestone myorg my-repo 3 --project=/path/to/my-laravel-app
```

The milestone command uses a label scheme on your GitHub issues:

| Label | Maps to |
|---|---|
| `larex:in-scope` | In scope items |
| `larex:out-of-scope` | Out of scope items |
| `larex:acceptance` | Acceptance criteria (required) |
| `larex:constraint` | Constraints |
| `larex:question` | Open questions |

Unlabeled issues fall through to in-scope automatically.

---

## Full command workflow (roadmap)

```bash
larex:milestone myorg my-repo 3       # import requirement
larex:plan     RUN-0001               # requirement → architecture plan
larex:audit    RUN-0001               # risk audit (blocks on high severity)
larex:approve  RUN-0001               # human approves exact PatchPlanHash
larex:patch    RUN-0001               # apply to target, run tests, update memory
```

Every command is safe to run in CI. Nothing mutates your codebase until `larex:approve`.

---

## Requirements

- PHP 8.4+
- Laravel 13+
- Anthropic API key — set `LAREX_ANTHROPIC_KEY` or use the standard `ANTHROPIC_API_KEY`
- GitHub token for milestone intake — set `LAREX_GITHUB_TOKEN`

---

## Self-bootstrapping

Larex is built using its own pipeline. Every feature starts as a GitHub milestone on this repo. The engine inspects itself, plans its own next changes, and applies them through its own approval gate.

If Larex can use its own pipeline to build its own next features, the pipeline is correct. That is the self-bootstrapping constraint — not a demo feature, but the correctness test for the whole system.

[Track progress on GitHub Milestones →](https://github.com/khakimjanovich/larex/milestones)

---

## Architecture

Larex is a standard Laravel application. The engine lives in `app/ArchEngine/`:

```
app/ArchEngine/
  DTO/           — typed value objects for every artifact schema
  Enums/         — MutationType and friends
  Pipeline/      — PipelineRunner, StageContract, StageResult, PipelineRunState
  Stages/        — one class per pipeline stage, each implements StageContract
  Stores/        — RunStore (artifact persistence at .larex/runs/RUN-xxxx/)
  TargetProject/ — project type detection
  Tools/         — CodebaseReader, GitHubClient
  Workers/       — PatchWorker (applies approved patch plans)

app/Ai/Agents/   — Laravel AI SDK agents (ArchitecturePlannerAgent)

app/Console/Commands/
  larex:inspect
  larex:milestone
```

All stage results carry a status (`succeeded` / `failed` / `blocked`), a typed payload, evidence refs, warnings, and errors. Non-recoverable failures stop the pipeline. Recoverable failures loop back to `ArchitectStage` with failures attached as evidence.

---

## Contributing

Issues and PRs are welcome. New features follow the same pipeline that Larex uses on other projects — open a milestone, label your issues, and the engine will plan the implementation.

---

## License

MIT
