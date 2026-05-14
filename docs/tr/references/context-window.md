# Context Penceresi (Token Bütçesi)

Amaç: Sohbet veya agent context'ine **gereksiz eski detay** taşımadan yalnızca şu an işe yarayan bilgiyi tutmak.

## Varsayılan Okuma Sırası (Önce Bunlar)

1. `.fur.planning/progress/latest.md` — kısa özet; tüm eski progress dosyalarını tek tek okumayın.
2. **Aktif task** (ready'deki hedef dosya veya kullanıcının verdiği task).
3. `.fur.planning/context/` içinde yalnızca ilgili dosyalar (ör. `verification.md`, `mcp.md`); hepsini dump etmeyin.

## Eski Task ve Konular

- **Tamamlanan task**: Tam metni chat'e yapıştırmayın; `tasks/done/` altındaki dosyaya **bağlantı veya dosya yolu** verin.
- **Backlog'da çok geride kalan / devre dışı**: Uzun gövdeyi `context/archive/` altına taşıyın; orijinal dosyada 5–10 satırlık **özet + archive'a link** bırakın (agent bunu yapabilir).
- **Plan dosyaları**: Paralel veya çok adımlı işler için `plans/` içinde tek plan dosyasında dallanın; her seferinde tüm plan geçmişini yüklemeyin; güncel bölümü özetleyin.

## Paralel Çalışma (Ayrı Skill Yok)

Paralel iş, **task veya plan yazarken** tanımlanır:

- Bağımsız dilimler (branch / worktree / sorumlu) plan metninde net yazılır.
- Örnek: aynı plan dosyasında `## Paralel Dilim A`, `## Paralel Dilim B` ve her biri için `git worktree add ...` önerisi.

## Otomatik Sıkıştırma (CLI)

Eski progress snapshot'larını taşımak için:

```bash
fur compact
```

Varsayılan: `progress/` kökünde en fazla **8** tarih damgalı `.md` snapshot kalır; daha eskiler `progress/archive/` altına taşınır. `latest.md` sembolik bağının hedefi korunur.

İsterseniz:

```bash
export FUR_PROGRESS_KEEP=5
fur compact
```

## Agent Kuralları (Özet)

- Uzun geçmişi özetleyin; gerekiyorsa `context/archive/` kullanın.
- Her önemli dönüşten sonra `fur refresh`; gerekiyorsa `fur compact` çalıştırın.
- Kullanıcıya durum verirken önce `latest.md` + aktif task özeti yeterlidir.
- Chat context'inde aynı anda 2–3'ten fazla aktif task'ın tam metnünü taşımamaya çalışın.
- İçerik 50 satırdan uzunsa dosya yolunu link olarak verin, yapıştırmayın.