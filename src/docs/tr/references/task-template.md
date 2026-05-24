# Task Şablonu

Task dosyaları `.fur.planning/tasks/backlog/` veya `.fur.planning/tasks/ready/` altında oluşturulurken bu şablonu kullanın.

## Dosya Adı Formatı

```
YYYYMMDD-HHMM-short-title.md
```

Örnek: `20250114-0930-add-dark-mode.md`

## Şablon

```md
# Task Başlığı

## Tür

feature | bug | refactor | chore | docs | test | investigation

## Task size

micro | standard | major

## Bağlam

Bu task neden var? Hangi problemi çözüyor?

## Hedef

Bu iş tamamlandığında ne doğru olmalı? Somut, ölçülebilir sonuç.

## Hedef Dışı

Bu task'in değiştirmemesi gereken şeyler. Kapsam sınırları.

## Acceptance Criteria (Kabul Kriterleri)

- [ ] Kriter 1
- [ ] Kriter 2
- [ ] Kriter 3

## Uygulama Notları

Teknik notlar, etkilenen dosyalar, kısıtlar, yaklaşım önerileri.

## Önerilen Dosyalar

- `path/to/dosya1`
- `path/to/dosya2`

## Doğrulama (Verification)

Bu task'ın tamamlandığını nasıl kontrol edersiniz? Çalıştırılacak komutlar, manuel adımlar.

## Riskler

Olası gerilemeler, açık sorular veya belirsizlik alanları.

## Açık Sorular

Yalnızca task hazır değilse gereklidir. Bloklayıcı açık soruları olan task `tasks/backlog/` altında kalır.

## İsteğe Bağlı: Paralel Dilimler

Bağımsız iş akışları varsa, dilimleri (A/B/...) adlandırın ve branch veya `git worktree` ipuçlarını burada veya `plans/` klasöründe belirtin. Uzun planları chat ve dosyalar arasında çift tutmayın.

## Tracker Sync

- Kaynak: local | jira | github
- Harici ID:
- Harici URL:
- Workspace Repo ID:
- Local dosya:
- Sync status: unsynced | imported | drafted | created | updated | closed
```

## İpuçları

- Task'ları tek bir odaklı oturumda tamamlanabilecek kadar küçük tutun.
- Her task en az bir acceptance criterion'a sahip olmalı.
- Her task doğrulama (verification) bölümüne sahip olmalı.
- Bir task fazla büyük hissediliyorsa, birden fazla küçük task'a bölün.
- Task dosyasına sığmayan detaylı uygulama planları için `plans/` klasörünü kullanın.
