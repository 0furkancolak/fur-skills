# Opsiyonel Superpowers Köprüsü

Fur ana workflow olarak kalır. Superpowers sadece ağır metodoloji gereken durumlarda opsiyonel bir köprü olarak kullanılır.

Superpowers içeriği bu repoya kopyalanmaz, fork edilmez, vendor edilmez ve otomatik kurulmaz. Varsayılan mod `optional` olduğu için Superpowers yoksa fur-skills flow devam eder.

## Varsayılan config

```json
{
  "methodology": {
    "superpowers": {
      "enabled": true,
      "mode": "optional",
      "fallback": "fur-skills",
      "brainstormingPolicy": "config-mandatory"
    }
  },
  "planning": {
    "planLock": "enabled",
    "defaultExecution": "subagent-driven",
    "batchExecution": "enabled"
  }
}
```

## fur-skills flow ne zaman kullanılır?

- Config açıkça opt-out veriyorsa veya Superpowers `optional` modda kullanılamıyorsa.
- İş küçük, net ve minimum ready-gate bilgileri tamamsa.
- Production davranışı değişmiyorsa.
- Kök neden zaten biliniyorsa.
- Çok adımlı plan yürütme gerekmiyorsa.
- Strict verification veya bağımsız review gerekmiyorsa.

## Superpowers ne zaman seçilir?

- Task/plan üretimi (`brainstormingPolicy: config-mandatory` varsayılanı).
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
| `fur-task` | task/plan üretiminde varsayılan `brainstorming`, onaylı spec için `writing-plans` |
| `fur-do` | `using-git-worktrees`, `test-driven-development`, multi-task planlarda varsayılan `subagent-driven-development`, fallback `executing-plans` |
| `fur-debug` | `systematic-debugging`, `verification-before-completion` |
| `fur-check` | `verification-before-completion`, `requesting-code-review`, `receiving-code-review` |
| `fur-done` | `finishing-a-development-branch` |
| `fur-status` | delegasyon yok; sadece bridge durumunu raporlar |

`planning.planLock` açıkken ajanlar aynı projedeki başka conversation'ın aktif planına otomatik atlamaz; plan net değilse explicit seçim ister. `planning.batchExecution` açıkken aynı plan lock içindeki bağımsız ready wave tek `fur-do` / `fur-done` batch'i olarak yürütülebilir.
