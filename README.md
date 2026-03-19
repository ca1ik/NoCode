# NoCode Zone

> **VS Code içinde kod görmeden yaşa.** Kod yazmayı bilmiyorum ama Copilot var — sloganlının uzantısı.

---

## Ne İşe Yarar?

**NoCode Zone**, VS Code içindeki tüm kodu görsel olarak gizler ve editör alanında YouTube veya istediğin herhangi bir web sayfasını açar. Copilot ile çalışmaya devam ederken, `kod bloklarını` bir daha görmek zorunda kalmazsın.

---

## Özellikler

| Özellik | Açıklama |
|---|---|
| **Tek Tıkla Toggle** | Status bar butonu ya da `Ctrl+Shift+N` ile anında geçiş |
| **Kod Gizleme** | Tüm editörler render katmanında maskeli, dosya içeriği değişmez |
| **Embed Tarayıcı** | YouTube dahili WebView'da açılır |
| **Fallback Browser** | Embed desteklemeyen siteler için otomatik sistem tarayıcısı |
| **Copilot Auto-Reveal** | Copilot etkileşim istediğinde perde otomatik kalkar |
| **Tema Seçimi** | Midnight, Ocean, Sunset, Forest, Minimal |
| **Hızlı Linkler** | Dashboard'dan favorite linklere tek tıkla ulaş |
| **Copilot Gizleme** | İstersen Copilot panel de gizlenir, sadece input gerektiğinde açılır |

---

## Kurulum

```bash
npm install
npm run build
```

Geliştirme modunda çalıştırmak için `F5`'e bas.

Marketplace paketi oluşturmak için:
```bash
npm run package
```

---

## Kullanım

1. VS Code başladığında extension otomatik aktif olur (NoCode modu varsayılan)
2. **Status bar**'daki `$(eye-closed) NoCode ON` butonuna tıkla
3. Dashboard yan panelden URL gir veya hazır linklerden birini seç
4. Copilot soru sorduğunda ekran otomatik normal moda döner, cevap verince tekrar NoCode'a geçebilirsin

### Klavye Kısayolları

| Kısayol | Aksiyon |
|---|---|
| `Ctrl+Shift+N` | NoCode / Normal mod toggle |
| `Ctrl+Shift+B` | Tarayıcı aç (NoCode aktifken) |

---

## Ayarlar

| Anahtar | Varsayılan | Açıklama |
|---|---|---|
| `nocodeZone.defaultMode` | `nocode` | Başlangıç modu |
| `nocodeZone.hideCopilot` | `false` | Copilot varsayılan gizli mi? |
| `nocodeZone.copilotAutoReveal` | `true` | Copilot dikkat isteyince otomatik aç |
| `nocodeZone.homepageUrl` | YouTube | Varsayılan anasayfa URL |
| `nocodeZone.theme` | `midnight` | Dashboard tema seçimi |
| `nocodeZone.quickLinks` | YouTube + Google + ChatGPT | Hızlı erişim linkleri |

---

## Bilinen Sınırlar

- Google gibi `X-Frame-Options: DENY` header'ı koyan siteler iframe'de açılamaz. Extension bu durumda sistem tarayıcısını otomatik açar.
- VS Code public API, Copilot'un tam iç durumuna erişim sağlamaz. Copilot auto-reveal mekanizması tab başlığı ve view aktivitesi gibi heuristics kullanır.
- Copilot görünürlüğünü tamamen programatik kontrol etmek için VS Code extension API'si henüz yeterli yetkiyi vermiyor. Bu kısıtlama VS Code tarafından konulmaktadır.

---

## Dikkat Edilmesi Gerekenler

- Dosya içeriği **hiçbir zaman değiştirilmez** — sadece render maskesi uygulanır. Kaydetme, undo, diff tamamen sağlıklı çalışır.
- Extension kapatılırsa dekorasyonlar otomatik temizlenir.
- Tema ve mod seçimi `globalState` ile kalıcı saklanır.

---

*NoCode Zone — Code optional, Copilot mandatory.*
