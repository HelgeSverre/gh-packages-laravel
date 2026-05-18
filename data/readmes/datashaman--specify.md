# Specify

Laravel 13 system where humans approve AI actions on code repos. AI proposes stories and edits, humans gate them, AI executes against real git repos.

## Quickstart

```bash
composer setup            # install deps, copy .env, key:generate, migrate, npm build
composer dev              # serve + queue + pail + vite, all at once
composer test             # pint --test + php artisan test
```

Requires PHP `^8.4`, Node, and SQLite by default. `composer setup` creates `database/database.sqlite` and runs migrations on first run.

## Domain at a glance

`Workspace -> Team -> Project -> Feature -> Story -> AcceptanceCriterion / Scenario -> Plan -> Task -> Subtask`.

- **Workspace** — tenant boundary, owned by a User. `Team` is workspace-scoped (M:N via `team_user`); Projects belong to Teams.
- **Feature** — product-owner grouping inside a Project. A Feature carries a name and description; Stories belong to Features. Reorderable within a Project; the canonical sort is `position`.
- **Story** — product-owner unit of value; carries kind, actor, intent, outcome, `revision` (auto-bumps on product edits), `description`, `notes`, acceptance criteria, and scenarios.
- **Plan** — implementation interpretation of a Story. `stories.current_plan_id` points at the active Plan; previous Plans remain history.
- **Task** — delivery work item under a Plan. A Task may reference an acceptance criterion or scenario, but it is not defined as one acceptance criterion. Subtasks are the executor's step list.
- **Approval is the core reframe.** `ApprovalPolicy` (Story/Project/Workspace cascade, configurable `required_approvals` threshold) plus immutable `StoryApproval` and `PlanApproval` logs. Story approval gates the product contract; current Plan approval gates execution. Tasks and Subtasks don't gate; the diff-review surface is the PR.

See `docs/architecture/` for current architecture explanations and `docs/adr/` for the load-bearing decisions in detail.

## How a run works

```
Story submitted and approved
  → Plan generated/replaced (GenerateTasksJob → TasksGenerator agent, structured output)
  → current Plan submitted and approved
  → Subtasks dispatched (ExecuteSubtaskJob)
      → SubtaskRunPipeline: prepare workdir → checkout branch → executor edits
      → commit → diff → push → open PR
  → mark Done → cascade
```

Product edits reopen Story approval and current Plan approval. Plan/Task/Subtask edits reopen Plan approval. `AgentRun` records every dispatch (polymorphic `runnable`, polymorphic `authorizing_approval`, append-only): task-generation runs may authorise against `StoryApproval`; execution runs authorise against `PlanApproval`.

## Pluggable executors

`Executor` interface — `needsWorkingDirectory()`, `execute(Subtask, ?workingDir, ?Repo, ?workingBranch, ?contextBrief = null, ?emitter = null, ?promptOverride = null): ExecutionResult`.

- `LaravelAiExecutor` — remote-capable; wraps the `SubtaskExecutor` agent, uses repo-editing tools, and resolves the run owner's BYOK credential.
- `CliExecutor` — local-only; runs any one-shot agent CLI (claude, codex, gemini, aider) in cwd, observes via `git status`.
- `FakeExecutor` — test double.

Bound by `specify.executor.default`. In hosted runtime (`SPECIFY_RUNTIME_ENV=hosted`), only remote executors are allowed unless a local driver is explicitly named in `SPECIFY_REMOTE_EXECUTORS` for a deployment with a remote-safe worker. User-triggered Laravel AI calls are BYOK: users configure their own Anthropic/OpenAI key at `/settings/ai`; the app does not need an operator-paid provider key for execution.

See `config/specify.php` for all knobs (`runs_path`, `git.{name,email}`, `workspace.{push_after_commit, open_pr_after_push}`, `github.api_base`, `runtime.environment`, `executor.{default,race,drivers}`).

## Hosted deployment

For a live server, start from `.env.example`, set `APP_ENV=production`, use a durable queue connection, and set:

```dotenv
SPECIFY_RUNTIME_ENV=hosted
SPECIFY_REMOTE_EXECUTORS=
SPECIFY_EXECUTOR_DRIVER=laravel-ai
SPECIFY_EXECUTOR_RACE=
```

Do not configure local CLI executors on the hosted app unless that deployment is explicitly a remote worker with its own isolated credentials and binaries, and the driver is named in `SPECIFY_REMOTE_EXECUTORS`. See `docs/operations/hosted-deployment.md` for the operational checklist.

## Repos

`Repo` is workspace-scoped with a `provider` enum (Github/Gitlab/Bitbucket/Generic) and encrypted `access_token` / `webhook_secret`. M:N with `Project` via `project_repo` (`role`, `is_primary`).

`PullRequestProvider` interface; drivers exist for GitHub, GitLab, and Bitbucket. `ExecuteSubtaskJob` opens a PR after push (config-gated); failures are recorded as `pull_request_error` and don't fail the run.

Branch naming: `specify/{feature-slug}/{story-slug}`; race-mode siblings add `-by-{driver}`.

## Where to look

| Area | Path |
|------|------|
| Approval state machine | `app/Services/ApprovalService.php` |
| MCP tool surface | `app/Mcp/Tools/` |
| Executors | `app/Services/Executors/` |
| Pull request providers | `app/Services/PullRequests/` |
| Git workdir lifecycle | `app/Services/WorkspaceRunner.php` |
| Run pipeline | `app/Services/SubtaskRunPipeline.php` |
| Run orchestration | `app/Jobs/GenerateTasksJob.php`, `app/Jobs/ExecuteSubtaskJob.php` |
| Architecture explanations | `docs/architecture/` |
| Status enums | `app/Enums/` |
| Architecture decisions | `docs/adr/` |
| Config | `config/specify.php` |

## Agent contributors

`AGENTS.md` (and its mirror `CLAUDE.md`) carry the Laravel Boost guidelines this repo follows. Read this README first for project context, then those for framework conventions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, test, style, and ADR conventions.

## License

MIT — see [LICENSE](LICENSE).
