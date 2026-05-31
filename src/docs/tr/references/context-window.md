# Context Penceresi (Token Bütçesi)

Amaç: Sohbet veya agent context'ine **gereksiz eski detay** taşımadan yalnızca şu an işe yarayan bilgiyi tutmak.

## Varsayılan Okuma Sırası (Önce Bunlar)

1. `.fur.planning/state.json` — `fur refresh` tarafından üretilen makine-okunur son durum.
2. `.fur.planning/progress/latest.md` — kısa özet; tüm eski progress dosyalarını tek tek okumayın.
3. **Aktif task** (ready'deki hedef dosya veya kullanıcının verdiği task).
4. `.fur.planning/context/` içinde yalnızca ilgili dosyalar (ör. `verification.md`, `mcp.md`); hepsini dump etmeyin.

## Eski Task ve Konular

- **Tamamlanan task**: Tam metni chat'e yapıştırmayın; `tasks/done/` altındaki dosyaya **bağlantı veya dosya yolu** verin.
- **Backlog'da çok geride kalan / devre dışı**: Uzun gövdeyi `context/archive/` altına taşıyın; orijinal dosyada 5–10 satırlık **özet + archive'a link** bırakın (agent bunu yapabilir).
- **Plan dosyaları**: Çok adımlı işler için `plans/` içinde tek plan dosyasında dilimleri tanımlayın; her seferinde tüm plan geçmişini yüklemeyin; güncel bölümü özetleyin.

## Dilimli Çalışma

Dilimli iş, **task veya plan yazarken** tanımlanır:

- Bağımsız dilimler plan metninde net yazılır.
- Örnek: aynı plan dosyasında `## Dilim A`, `## Dilim B` ve her biri için kapsam ile bağımlılıklar.

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
- Her önemli dönüşten sonra `fur refresh`; bu komut hem `progress/latest.md` hem `state.json` günceller. Gerekiyorsa `fur compact` çalıştırın.
- Kullanıcıya durum verirken önce `state.json` + `latest.md` + aktif task özeti yeterlidir.
- Chat context'inde aynı anda 2–3'ten fazla aktif task'ın tam metnünü taşımamaya çalışın.
- İçerik 50 satırdan uzunsa dosya yolunu link olarak verin, yapıştırmayın.
