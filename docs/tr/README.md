# fur-skills — Türkçe Dokümantasyon

Bu klasör, fur-skills repodaki ana dokümantasyonun Türkçe özetini içerir.

> İngilizce dokümantasyon en güncel kaynak kabul edilir.

## Hızlı Başlangıç

```bash
cd /path/to/fur-skills
./scripts/install.sh
```

Projede:

```bash
fur init
```

Açık ayarlı kurulum:

```bash
fur init --gitignore --project-maturity new --question-level high
fur init --gitignore --project-maturity established --question-level normal
```

Birden fazla repo bulunan klasörde:

```bash
fur workspace init
fur workspace doctor
```

Installer ayrıca OpenCode için global komut kurar:

```txt
/clone-website <url>
```

## Temel Döngü

```txt
fur-init -> fur-task -> fur-do -> fur-check -> fur-done -> fur-status
                 \-> fur-debug ->/
```

## Core Skill'ler

| Skill | Görev |
|---|---|
| `fur-init` | `.fur.planning`, local config, soru seviyesi ve workspace ipuçlarını kurar. |
| `fur-task` | Local/Jira/GitHub kaynaklardan küçük task üretir, seçer veya böler. |
| `fur-do` | Seçili task'ı uygular. |
| `fur-check` | Acceptance, test, typecheck/lint ve review kapısıdır. |
| `fur-done` | Task'ı done'a taşır, snapshot alır, config izinliyse tracker sync yapar. |
| `fur-status` | Nerede kalındığını ve sıradaki tek aksiyonu gösterir. |
| `fur-debug` | Kök nedeni bilinmeyen bug'lar için fazlı debug akışıdır. |

## Soru Seviyeleri

| Seviye | Davranış |
|---|---|
| `low` | Sadece blocker belirsizlik, güvensiz tracker yönlendirmesi veya yüksek riskte sorar. |
| `normal` | Scope, acceptance criteria, tracker hedefi veya verification eksikse sorar. |
| `high` | Gereksinimler zayıfsa ürün, edge-case, veri ve rollout soruları da sorar. |

Varsayılanlar:

- Yeni proje: `projectMaturity: "new"`, `questionLevel: "high"`.
- Oturmuş proje: `projectMaturity: "established"`, `questionLevel: "normal"`.

## CLI

| Komut | Görev |
|---|---|
| `fur init` | TTY'de sorular sorarak, non-TTY'de güvenli defaultlarla `.fur.planning` oluşturur. |
| `fur workspace init` | `.fur.workspace/config.json` oluşturur. |
| `fur workspace doctor` | Workspace repo/tracker config'ini doğrular. |
| `fur refresh` | `fur-done` için yardımcı progress snapshot komutu. |
| `fur progress` | `fur-status` için yardımcı kısa durum komutu. |
| `fur compact` | Eski snapshot'ları arşivler. |
| `fur doctor` | Kurulum ve skill symlink durumunu gösterir. |

## Referanslar

- [`references/planning-layout.md`](../../references/planning-layout.md)
- [`references/task-template.md`](../../references/task-template.md)
- [`references/context-window.md`](../../references/context-window.md)
