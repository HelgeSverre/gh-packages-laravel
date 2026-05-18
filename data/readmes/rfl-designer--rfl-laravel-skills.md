# rfl-laravel-skills

Plugin Claude Code que orquestra o ciclo de desenvolvimento **Laravel 12 + Livewire 4 + Tailwind + Alpine + Flux UI**.

Trabalha em conjunto com [`laravel/boost`](https://github.com/laravel/boost) — o boost fornece guidelines de stack (versões, padrões idiomáticos), este plugin fornece o **processo** (grilling, PRDs, issues, TDD, review consolidado, roadmap).

## Atualização

Como o plugin instala skills + agents, a atualização tem nuances:

| O que atualizar | Comando |
|---|---|
| Tudo (Caminho A — `/plugin install`) | `cd <plugin-path> && git pull` |
| Skills (Caminho B — `npx skills`) | `npx skills update` (todas) ou `npx skills update tdd open-pr` (por nome) |
| Agent (qualquer caminho) | `cd ~/.local/share/rfl-laravel-skills && git pull` (se symlinkado pelo setup) |
| Re-validar configs/symlinks | `/setup-rfl-laravel-skills` (idempotente) |

> ⚠️ `npx skills update <nome>` recebe o **nome da skill** (do frontmatter, ex: `tdd`, `open-pr`), não o nome do repo (`rfl-laravel-skills`). Para listar nomes instalados: `npx skills list`.
>
> ⚠️ Se também usa `mattpocock/skills`, os nomes `grill-with-docs` e `tdd` colidem (mesmo `name:` no frontmatter). A última instalada ganha. Para forçar a versão deste plugin: `npx skills remove tdd && npx skills add rfl-designer/rfl-laravel-skills --skill tdd`.

## Instalação

Você tem **dois caminhos** com trade-offs claros. Escolha conforme seu cenário:

### Caminho A — Claude Code nativo via `/plugin install` (recomendado para Claude Code)

Pega tudo: **11 skills + 1 agent** em uma única operação. Necessário porque a CLI universal (caminho B) só lida com skills, não com agents.

```
git clone https://github.com/rfl-designer/rfl-laravel-skills.git ~/plugins/rfl-laravel-skills
```

No Claude Code:
```
/plugin install ~/plugins/rfl-laravel-skills
```

O Claude Code lê `.claude-plugin/plugin.json` e registra skills + agent simultaneamente. Atualiza com `git pull` no clone.

### Caminho B — `npx skills add` (universal, multi-agent)

Funciona com Claude Code, Codex, Cursor, OpenCode e outros. **Limitação:** instala apenas as 11 skills em `.claude/skills/`. **O agent `laravel-simplifier` precisa ser copiado manualmente** para `.claude/agents/` (a CLI universal ainda não suporta agents).

Abra um terminal **normal** (fora do Claude Code/Codex) e rode:

```bash
npx skills add rfl-designer/rfl-laravel-skills
```

A CLI vai perguntar:
1. **Escopo** — Project (`./.claude/skills/`) ou Global (`~/.claude/skills/`)
2. **Quais skills** instalar
3. **Quais agents-target** (claude-code, codex, cursor, opencode, etc.)
4. **Método** — symlink (recomendado) ou copy

> ⚠️ Quando rodado **de dentro** de um agent (ex.: o próprio Claude Code), a CLI detecta o ambiente e instala não-interativamente. Para o prompt interativo, use terminal externo.

Para o agent Claude Code, faça um clone separado e symlink:

```bash
# Global (todos os projetos veem)
git clone https://github.com/rfl-designer/rfl-laravel-skills.git ~/plugins/rfl-laravel-skills
mkdir -p ~/.claude/agents
ln -sf ~/plugins/rfl-laravel-skills/agents/laravel-simplifier.md ~/.claude/agents/

# OU project-local (.claude/ no projeto)
mkdir -p .claude/agents
ln -sf ~/plugins/rfl-laravel-skills/agents/laravel-simplifier.md .claude/agents/
```

Ou use `/setup-rfl-laravel-skills` no Claude Code — a skill detecta esse cenário e oferece copiar o agent para você.

### Flags úteis da CLI (caminho B)

```bash
# Tudo, sem perguntar
npx skills add rfl-designer/rfl-laravel-skills -g --all

# Só algumas skills
npx skills add rfl-designer/rfl-laravel-skills --skill tdd --skill open-pr

# Só listar
npx skills add rfl-designer/rfl-laravel-skills --list

# Agent específico
npx skills add rfl-designer/rfl-laravel-skills -a claude-code -g
```

## Fluxo

```
/setup-rfl-laravel-skills  →  bootstrap one-shot (uma vez por repo)
/setup-quality-gates       →  catraca de qualidade para PRs com IA
/grill-with-docs  →  CONTEXT.md + ADRs do que foi decidido
/to-prd           →  docs/prd/<slug>.md + issue PRD no GitHub
/to-issues        →  N issues vertical-slice no GitHub
(escolher uma)
/tdd              →  red-green-refactor em Pest, slice completa
/simplify         →  laravel-simplifier passa sobre o diff
/open-pr          →  PR no GitHub, linkada à issue
/review-pr        →  review consolidado sem sub-agents (Laravel + Livewire/Flux + Pest + spec vs issue)
(PR merged)
/organize-docs    →  ADRs propostos, glossário atualizado
/update-roadmap   →  docs/roadmap/index.html atualizado por ondas
```

## Skills

### Setup (`skills/setup/`) — rode primeiro

- **[setup-rfl-laravel-skills](./skills/setup/setup-rfl-laravel-skills/SKILL.md)** — valida pré-requisitos (gh, Pest, Pint, boost), cria `docs/` tree, semeia configs em `.claude/`, adiciona bloco `## Agent skills` em `CLAUDE.md`/`AGENTS.md`. Idempotente — re-rodar é seguro.
- **[setup-quality-gates](./skills/setup/setup-quality-gates/SKILL.md)** — instala quality gates com baseline/catraca para Laravel 12+ + Livewire 4 + Alpine + Tailwind CSS v4, incluindo script local e workflow GitHub Actions.

### Process (`skills/process/`)

- **[grill-with-docs](./skills/process/grill-with-docs/SKILL.md)** — entrevista que estressa o plano contra o domínio e atualiza CONTEXT.md/ADRs inline.
- **[to-prd](./skills/process/to-prd/SKILL.md)** — sintetiza a conversa atual num PRD com template Laravel e publica como issue.
- **[to-issues](./skills/process/to-issues/SKILL.md)** — quebra um PRD em slices verticais Laravel (4 camadas) e abre uma issue por slice.
- **[tdd](./skills/process/tdd/SKILL.md)** — red-green-refactor com Pest 3/4. Slice vertical Laravel por ciclo.
- **[open-pr](./skills/process/open-pr/SKILL.md)** — abre PR no GitHub gated por Pest+Pint, com título derivado de Conventional Commits.

### Laravel (`skills/laravel/`)

- **[simplify](./skills/laravel/simplify-with-agent/SKILL.md)** — invoca `laravel-simplifier` sobre o diff não-commitado.
- **[review-pr](./skills/laravel/review-pr/SKILL.md)** — revisa PR em uma passagem consolidada, sem sub-agents, cobrindo Laravel, Livewire/Flux, Pest e spec compliance vs issue.

### Docs (`skills/docs/`)

- **[organize-docs](./skills/docs/organize-docs/SKILL.md)** — varredura interativa pós-PRs: ADRs, termos novos, PRDs arquivados, links quebrados.
- **[update-roadmap](./skills/docs/update-roadmap/SKILL.md)** — gera `docs/roadmap/index.html` por ondas, cards em grid de 3 colunas.

## Agents

- **[laravel-simplifier](./agents/laravel-simplifier.md)** — refatora código PHP/Laravel preservando comportamento. (Importado de [laravel/agent-skills](https://github.com/laravel/agent-skills), Apache-2.0.)

## Status

Sprint A ✅ fundação (Etapas 0, 1, 4) — `grill-with-docs`, `tdd`.
Sprint B ✅ planejamento (Etapas 2, 3) — `to-prd`, `to-issues`.
Sprint C ✅ entrega (Etapas 5, 6, 7) — `open-pr`, `simplify`, `review-pr` consolidado.
Sprint D ✅ manutenção (Etapas 8, 9) — `organize-docs`, `update-roadmap`.
Bootstrap ✅ `setup-rfl-laravel-skills` — one-shot por repo.
Quality Gates ✅ `setup-quality-gates` — baseline ratchet para PRs com IA.

**Plugin completo.** 11 skills + 1 agent. As 9 etapas do PLAN.md estão implementadas.

Veja [PLAN.md](../PLAN.md) para detalhes.

## Créditos

- Skills `grill-with-docs` e `tdd` derivadas de [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) — `tdd` reescrita para Pest, `grill-with-docs` mantida com pequenos ajustes.
- Agent `laravel-simplifier` (a ser importado na Etapa 6) de [laravel/agent-skills](https://github.com/laravel/agent-skills) (Apache-2.0).

## Licença

MIT
