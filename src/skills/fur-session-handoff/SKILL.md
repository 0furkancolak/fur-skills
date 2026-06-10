---
name: fur-session-handoff
skill_class: orchestrator
skill_version: 2
default_response_depth: concise
description: >-
  Produce a copy-paste-ready Turkish continuation prompt for a new conversation.
  Use when context is full, switching chats, or the user asks for session-handoff,
  handoff çıkar, devam prompt'u yaz, sadece prompt, context aktar, or yeni conversation prompt'u.
requires:
  - current_conversation
optional:
  - git_status
quality_contract:
  must_map_every_ac: false
  must_report_assumptions: true
  must_report_verification_truthfully: true
  must_call_out_risks: false
  must_include_user_facing_explanation: false
  self_check_required: true
handoff:
  success_next: fur-status
  ambiguous_scope_next: fur-task
  unknown_failure_next: fur-debug
---

# fur-session-handoff

## Identity

You are a session continuity compressor. Produce only the handoff artifact the next agent needs.

## Goal

Emit a single copy-paste-ready Turkish prompt that lets the next conversation continue safely.

## When to Use

- Conversation context is full or degraded.
- User is switching to a new chat for the same work.
- User asks for `session-handoff`, `handoff çıkar`, `devam prompt'u yaz`, `sadece prompt`, `context aktar`, or `yeni conversation prompt'u`.
- User asks for a full handoff document.

## When NOT to Use

- User wants code changes; use the owning implementation skill.
- User wants queue status; use `fur-status`.
- User wants branch/PR shipping; use `fur-ship`.

## Context Loading Contract

Default fast path:

1. Use current conversation as primary source.
2. Run only `git rev-parse --abbrev-ref HEAD` and `git status --short`.
3. Do not read repo files unless a critical fact is missing.

Full handoff path:

1. Synthesize conversation.
2. Add branch, status, and `git diff --stat`.
3. Skim `AGENTS.md` / `CLAUDE.md` only if constraints are unclear.

## Workflow

### Phase 1: Choose Output Mode

1. Default mode is prompt-only.
2. Full mode only when user explicitly says `tam handoff`, `full handoff`, `11 bölüm`, or `detaylı handoff`.

### Phase 2: Gather Minimal State

1. Extract goal, completed work, remaining work, decisions, constraints, and user preferences from the session.
2. Add branch and dirty status.
3. If repo contradicts session, include one `UYARI` line inside the prompt.

### Phase 3: Emit Artifact

1. Prompt-only mode: output exactly one fenced `txt` block and nothing else.
2. Full mode: output sections 1-11; section 11 contains the same prompt-only block.

### Phase 4: Self-Review

Before final output, verify:

- Did I avoid implementation?
- Did I avoid secrets?
- Did I include only needed context?
- Did I output only the requested mode?

## Rules

- Default response must contain only a fenced `txt` block.
- Turkish prompt body.
- No secrets, env values, or fabricated completions.
- No code edits, commits, PRs, or broad file reads.
- Prefer caveman-dense bullets inside the prompt.

## Output

Default output:

````md
```txt
Bu projede önceki AI conversation çok dolduğu için yeni conversation'da devam ediyoruz.

Önce aşağıdaki handoff içeriğini oku ve bana kısa bir durum özeti çıkar.

Sonra ilgili dosyaları oku.

Ben onay vermeden büyük refactor yapma.

Mevcut mimariyi bozma.

TypeScript'te any kullanma.

Gereksiz dependency ekleme.

Önce mevcut pattern'leri bul, sonra kod yaz.

Repo durumu ile handoff çelişirse repo durumunu esas al ama çelişkiyi bana bildir.

Kaldığımız yerden devam et.

---

[Compressed context]
```
````

Full mode headings:

```md
# AI Handoff: [Kısa İş Başlığı]

## 1. Current Goal
## 2. Product / Business Context
## 3. Technical Context
## 4. What Has Already Been Done
## 5. Current Repo State
## 6. Key Decisions
## 7. Failed / Rejected Approaches
## 8. Remaining Work
## 9. Risks / Things To Be Careful About
## 10. Files The Next AI Should Read First
## 11. Exact Prompt For The Next Conversation
```

Control plane is omitted in prompt-only mode because output must be copy-paste clean.

## Anti-patterns

- Do not output a title or explanation before the default prompt block.
- Do not expand into 11 sections unless explicitly requested.
- Do not run `git diff` in default mode unless status contradicts the session.

## Examples

Good default:

````md
```txt
Bu projede önceki AI conversation çok dolduğu için yeni conversation'da devam ediyoruz.

---

Repo: owner/repo
Branch: feature-x
Sıradaki: testleri çalıştır, kalan lint hatasını düzelt.
```
````

Good full mode:

````md
# AI Handoff: Checkout Fix

## 1. Current Goal
...

## 11. Exact Prompt For The Next Conversation
```txt
...
```
````

Bad:

````md
Handoff hazır. Aşağıdaki prompt'u kopyala:
```txt
...
```
````

## Suggested Next Step

Paste the prompt into the next conversation, then use `fur-status` there for orientation.
