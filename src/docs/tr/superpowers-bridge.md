# Opsiyonel Superpowers Köprüsü

Fur ana workflow olarak kalır. Superpowers sadece ağır metodoloji gereken durumlarda opsiyonel bir köprü olarak kullanılır.

Superpowers içeriği bu repoya kopyalanmaz, fork edilmez, vendor edilmez ve otomatik kurulmaz. Varsayılan mod `optional` olduğu için Superpowers yoksa Fur native flow devam eder.

## Varsayılan config

```json
{
  "methodology": {
    "superpowers": {
      "enabled": true,
      "mode": "optional",
      "fallback": "fur-native"
    }
  }
}
```

## Fur native flow ne zaman kullanılır?

- İş küçük ve netse.
- Production davranışı değişmiyorsa.
- Kök neden zaten biliniyorsa.
- Çok adımlı plan yürütme gerekmiyorsa.
- Strict verification veya bağımsız review gerekmiyorsa.

## Superpowers ne zaman seçilir?

- Belirsiz ürün, feature, tasarım veya mimari çalışması.
- Onaylanmış spec/design için uygulama planı çıkarma.
- Kök nedeni bilinmeyen debug.
- Riskli production davranışı veya kritik akış değişiklikleri.
- TDD-heavy bugfix veya acceptance test gerektiren işler.
- Çok adımlı plan yürütme.
- Strict verification, bağımsız code review veya branch/worktree bitirme.

## Routing

| Fur skill | Opsiyonel Superpowers delegasyonu |
|---|---|
| `fur-task` | `brainstorming`, `writing-plans` |
| `fur-do` | `using-git-worktrees`, `test-driven-development`, `subagent-driven-development`, `executing-plans` |
| `fur-debug` | `systematic-debugging`, `verification-before-completion` |
| `fur-check` | `verification-before-completion`, `requesting-code-review`, `receiving-code-review` |
| `fur-done` | `finishing-a-development-branch` |
| `fur-status` | delegasyon yok; sadece bridge durumunu raporlar |

Küçük ve net işlerde Superpowers seçilmemelidir.
