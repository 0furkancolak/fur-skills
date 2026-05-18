import type { MessageCatalog } from "./types.ts";

export const tr: MessageCatalog = {
  "install.intro": "fur install",
  "install.cancelled": "Kurulum iptal edildi.",
  "install.doneOk": "Kurulum tamamlandı. `fur help` ile deneyebilirsiniz.",
  "install.doneIssues":
    "Kurulum bitti ancak bazı kontroller başarısız — yukarıyı inceleyin.",
  "install.noTtyDefaults": "TTY yok — varsayılan kurulum seçenekleri kullanılıyor.",

  "prompt.language": "Kurulum dili",
  "prompt.languageEn": "English",
  "prompt.languageTr": "Türkçe",
  "prompt.hosts": "Skill'leri hangi ortamlara kurulsun?",
  "prompt.installCli": "~/bin/fur CLI symlink kurulsun mu?",
  "prompt.installOpencode": "OpenCode clone-website komutu kurulsun mu?",
  "prompt.removeObsolete": "Eski/obsolete fur skill symlink'leri temizlensin mi?",
  "prompt.continueInstall": "Kuruluma devam edilsin mi?",
  "prompt.opencodeSourceMissing":
    "OpenCode kaynağı bulunamadı — clone-website atlanacak.",

  "note.preflightTitle": "Kurulum öncesi kontroller",
  "note.postflightOk": "Kurulum sonrası — tamam",
  "note.postflightIssues": "Kurulum sonrası — sorunlar var",

  "preflight.homeMissing": "HOME ortam değişkeni tanımlı değil",
  "preflight.homeOk": "HOME: {home}",
  "preflight.bunMissing": "Bun PATH içinde bulunamadı",
  "preflight.bunFound": "Bun: {path}",
  "preflight.bunHint": "https://bun.sh adresinden kurun",
  "preflight.cliSourceOk": "CLI kaynağı: {path}",
  "preflight.cliSourceMissing": "CLI kaynağı eksik: {path}",
  "preflight.skillsFound": "{count} fur skill bulundu",
  "preflight.skillsMissing": "Kurulacak fur skill bulunamadı",
  "preflight.skillsDirUnreadable": "Skills dizini okunamadı: {path}",
  "preflight.hostOk": "{label}: {dir}",
  "preflight.hostNotWritable": "{label}: yazılamıyor — {dir}",
  "preflight.cliTargetOk": "CLI hedefi: {path}",
  "preflight.cliTargetFail": "~/bin oluşturulamıyor veya yazılamıyor",
  "preflight.opencodeWillInstall": "OpenCode clone-website komutu kurulacak",
  "preflight.opencodeWillSkip": "OpenCode kaynağı yok — bu adım atlanacak",
  "preflight.pathHint":
    "PATH içinde ~/bin yok — kurulumdan sonra shell config'e eklemeniz gerekebilir",
  "preflight.criticalFailed": "Kritik kontroller başarısız — kuruluma devam edilemiyor.",

  "postflight.symlinkBad": "{label} / {skill} — symlink hatalı veya eksik",
  "postflight.sharedBad": "{label} / _shared — symlink hatalı",
  "postflight.cliExecutable": "fur CLI (çalıştırılabilir): {path}",
  "postflight.cliNotExecutable": "fur CLI çalıştırılamıyor: {path}",
  "postflight.cliRunOk": "`fur help` PATH üzerinden çalıştı",
  "postflight.cliRunFail": "`fur help` başarısız (exit {code})",
  "postflight.opencodeOk": "OpenCode clone-website komutu",
  "postflight.opencodeBad": "OpenCode symlink hatalı veya eksik",

  "cli.criticalFailed": "Kritik kontroller başarısız — kurulum iptal.",
  "cli.installing": "Kuruluyor…",
  "cli.installFailed": "Kurulum başarısız",
  "cli.skillsInstalled": "{count} skill kuruldu: {names}",
  "cli.installDone": "Kurulum tamamlandı.",
  "cli.installDoneIssues": "Kurulum bitti — sorunlar var.",

  "uninstall.intro": "fur uninstall",
  "uninstall.done": "{count} symlink kaldırıldı.",
  "uninstall.nonInteractiveDone": "{count} symlink kaldırıldı.",

  "warn.pathMissing":
    'PATH içinde ~/bin yok. Shell config\'e ekleyin:\n  export PATH="$HOME/bin:$PATH"',
};
