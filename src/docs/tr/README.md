# fur-skills — Türkçe Dokümantasyon

Bu klasör, fur-skills repodaki ana dokümantasyonun Türkçe özetini içerir.

> İngilizce dokümantasyon en güncel kaynak kabul edilir.

## Hızlı Başlangıç

```bash
cd /path/to/fur-skills
bun install && fur install
```

Projede:

```bash
fur init
```

Açık ayarlı kurulum:

```bash
fur init --gitignore --project-maturity new --question-level high --response-depth standard --evidence-style inline --verification-strictness normal --automation-mode guided
fur init --gitignore --project-maturity established --question-level normal --response-depth deep --evidence-style inline-plus-paths --verification-strictness strict --automation-mode guided
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
fur-init -> fur-task -> fur-do -> fur-done
                 \-> fur-check (opsiyonel/gömülü) ->/
                 \-> fur-debug ->/
```

## v3 Mimari

fur-skills v3; `docs/ai` tabanlı, contract-first, provider-aware ve eval-driven bir skill sistemidir.

- **Contract-first**: Her skill net bir kalite sözleşmesine sahiptir (`skill-spec-v2.md`).
- **Provider-aware**: Claude, OpenAI reasoning ve generic hostlar için ayrı overlay yaklaşımı vardır (`src/skills/_shared/overlays/`).
- **Eval-driven**: Skill kalitesi prompt setleri, golden output'lar ve grader'lar ile ölçülür (`src/evals/`).
- **Birleşebilir akış**: Kullanıcı isterse Fur skill'leri başka skill/tool çıktılarıyla birlikte kullanılabilir; Fur yerel task/state contract'ını korur.
- **Caveman varsayılanı**: Netliği bozmuyorsa kısa, düşük gürültülü caveman tarzı çıktı tercih edilir.

## Skill Sınıfları

| Sınıf | Sorumluluk | Varsayılan Derinlik |
|---|---|---|
| **orchestrator** | Yönlendirme, özetleme, arşivleme | concise |
| **planner** | Ayrıştırma, netleştirme, tasarım | standard |
| **executor** | Tek kapsamlı task uygulama | deep |
| **gate** | Doğrulama, review, kabul/red | standard |
| **diagnostic** | Bilinmeyen kök neden analizi | deep |

## responseDepth

`responseDepth`, model çıktısının ne kadar detaylı olacağını belirler. `questionLevel` ile karıştırılmamalıdır.

| Seviye | Davranış |
|---|---|
| `concise` | Kısa operasyonel çıktı. 1-3 cümle + dosya listesi + sonraki adım. |
| `standard` | Acceptance criteria, dosyalar, kontroller ve önemli riskleri içeren kompakt standart çıktı. |
| `deep` | Gerektiğinde veya istendiğinde geniş audit trail; tam transcript, plan diff veya tekrar eden tablolar basılmaz. |

## evidenceStyle

| Seviye | Davranış |
|---|---|
| `paths-only` | Sadece dosya yolları. |
| `inline` | Kısa snippet + açıklama (≤5 satır). |
| `inline-plus-paths` | Snippet + path + güçlü kanıt. |

## verificationStrictness

| Seviye | Davranış |
|---|---|
| `loose` | Araç yoksa manuel kontrol kabul edilir. |
| `normal` | Mevcut kontroller koşulur, eksikler açıkça yazılır. |
| `strict` | Kontrol eksikse blocker olarak raporlanır. |

## Dış Metodolojiler

fur-skills başka skill sistemleri ve tool'larla birlikte kullanılabilir. Dış skill çıktısı bağlam sayılır; `docs/ai` task dosyaları, plan manifestleri, progress snapshot'ları, tracker routing, verification raporu ve kapanış Fur tarafından yönetilir.

## Soru Seviyeleri

| Seviye | Davranış |
|---|---|
| `low` | Sadece blocker belirsizlik, güvensiz tracker yönlendirmesi veya yüksek riskte sorar. |
| `normal` | Scope, acceptance criteria, tracker hedefi veya verification eksikse sorar. |
| `high` | Gereksinimler zayıfsa ürün, edge-case, veri ve rollout soruları da sorar. |

Varsayılanlar:

- Yeni proje: `projectMaturity: "new"`, `questionLevel: "high"`, `responseDepth: "standard"`, `evidenceStyle: "inline"`, `verificationStrictness: "normal"`.
- Oturmuş proje: `projectMaturity: "established"`, `questionLevel: "normal"`.

## Skill Kalite Sözleşmesi

Her skill şu kurallara uyar:

- Scope küçük tutulur ama açıklama yüzeysel bırakılmaz.
- Önemli iddialar kanıtsız yazılmaz.
- Acceptance criteria tek tek karşılanır veya açıkça gap olarak belirtilir.
- Verification sonucu uydurulmaz.
- Riskler seviyeleriyle yazılır.
- Çıktı sonunda doğru sonraki skill önerilir.

## Core Skill'ler

| Skill | Sınıf | Görev |
|---|---|---|
| `fur-init` | orchestrator | `docs/ai`, context dosyaları, local config, AGENTS yönlendirmesi, CLAUDE redirect'i ve workspace ipuçlarını kurar/günceller. |
| `fur-task` | planner | Local/Jira/GitHub kaynaklardan küçük task üretir, seçer veya böler. |
| `fur-do` | executor | Seçili task'ı uygular. |
| `fur-check` | gate | Standalone veya gömülü acceptance, test, typecheck/lint ve review kapısıdır. |
| `fur-done` | orchestrator | İç check kapısını çalıştırır, doğrulanmış task'ı done'a taşır, snapshot/state alır, config izinliyse tracker sync yapar. |
| `fur-status` | orchestrator | İstendiğinde nerede kalındığını ve sıradaki tek aksiyonu gösterir. |
| `fur-debug` | diagnostic | Kök nedeni bilinmeyen bug'lar için fazlı debug akışıdır. |
| `fur-session-handoff` | orchestrator | Yeni conversation için kopyala-yapıştır hazır Türkçe devam prompt'u üretir. |
| `fur-ship` | orchestrator | Branch/PR durumunu kontrol eder, commit/PR metninden AI attribution temizler, approval gate ile GitHub PR akışını hazırlar. |

## UI Skill'leri

| Skill | Sınıf | Görev |
|---|---|---|
| `fur-ui-design` | planner | Kodlamadan önce UI yönünü belirler. |
| `fur-ui-clone` | executor | Browser extraction + spec + builder + visual QA ile piksel-uyumlu klon. |
| `fur-ui-review` | gate | UI/UX kalite review'si. |

## CLI

| Komut | Görev |
|---|---|
| `fur init` | TTY'de sorular sorarak, non-TTY'de güvenli defaultlarla `docs/ai` oluşturur. |
| `fur init --gitignore --question-level high --project-maturity new --response-depth standard --evidence-style inline --verification-strictness normal --automation-mode guided` | Non-interactive init. |
| `fur workspace init` | `.fur.workspace/config.json` oluşturur. |
| `fur workspace doctor` | Workspace repo/tracker config'ini doğrular. |
| `fur refresh` | `fur-done` için progress snapshot ve `docs/ai/state.json` üreten yardımcı komut. |
| `fur progress` | `fur-status` için kısa durum ve plan completion komutu. |
| `fur compact` | Eski snapshot'ları arşivler. |
| `fur doctor` | Kurulum, skill symlink, v2 section ve eval fixture durumunu gösterir. |

## Referanslar

- [`references/planning-layout.md`](../references/planning-layout.md) — `docs/ai` ve `.fur.workspace` yapısı
- [`references/task-template.md`](../references/task-template.md) — task dosyası şablonu
- [`references/context-window.md`](../references/context-window.md) — bağlam bütçesi kuralları
- [`references/skill-spec-v2.md`](../references/skill-spec-v2.md) — zorunlu ortak skill sözleşmesi
- [`references/output-rubrics.md`](../references/output-rubrics.md) — derinlik, kalite, kanıt ve risk rubrikleri
- [`references/context-pack-rules.md`](../references/context-pack-rules.md) — lean / standard / rich bağlam kuralları
- [`references/eval-design.md`](../references/eval-design.md) — golden data set, trace grading ve grader kuralları
- [`references/v2-completion-checklist.md`](../references/v2-completion-checklist.md) — v2 tamamlama kontrol listesi
