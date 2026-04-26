# Test Dosyaları Rehberi

Bu belge, frontend uygulamasındaki tüm component test dosyalarını, ne işe yaradıklarını ve nasıl çalıştıklarını açıklar.

---

## Testler Nasıl Çalıştırılır?

```bash
# frontend klasöründe tek seferlik çalıştır
cd frontend
npx vitest run

# Belirli bir dosyayı test et
npx vitest run src/app/features/auth/login/login.spec.ts

# İzleme modunda çalıştır (dosya değişince otomatik yeniden çalışır)
npx vitest
```

---

## Test Altyapısı

Proje **Vitest** + **Angular Testing Utilities** kullanır:

- `TestBed`: Angular bileşenlerini izole ortamda oluşturmak için kullanılır.
- `ComponentFixture`: Bileşenin DOM'una ve instance'ına erişim sağlar.
- `vi.fn()` / `vi.spyOn()`: Servis metodlarını taklit etmek (mock) için kullanılır.
- `of()` / `throwError()`: RxJS observable'larını simüle etmek için kullanılır.
- `signal()` / `computed()`: Angular signal'larını mock'lamak için kullanılır.

---

## Auth (Kimlik Doğrulama) Testleri

### `features/auth/login/login.spec.ts`

**Ne test eder:** Login bileşeninin kullanıcı girişi akışını.

**Kapsam:**
- Bileşen başlangıç durumu (boş email/şifre, loading=false)
- `onLogin()`: AuthService'e doğru parametrelerle çağrı yapılması
- `onLogin()`: Hata durumunda `errorMessage` set edilmesi
- `onLogin()`: Her denemede önceki hata mesajının temizlenmesi
- `onCreateAccount()`: `/signup` rotasına yönlendirme
- Template: Form, email ve şifre input'larının render edilmesi

**Nasıl çalışır:** `AuthService.login()` metodu `vi.fn()` ile mock'lanır. Başarılı senaryoda `of(...)` ile sahte bir response döndürülür, hata senaryosunda `throwError(...)` kullanılır.

---

### `features/auth/signup/signup.spec.ts`

**Ne test eder:** Signup bileşeninin kayıt akışını.

**Kapsam:**
- Başlangıç durumu (boş alanlar, `termsAccepted=false`, `showPassword=false`)
- `onSignup()`: Şartlar kabul edilmeden çağrı yapılmaması
- `onSignup()`: Ad ve soyadın birleştirilerek `fullName` oluşturulması
- `onSignup()`: Hata durumunda `errorMessage` set edilmesi
- `onSignup()`: Fallback hata mesajı
- Template: Form render edilmesi

**Nasıl çalışır:** `AuthService.signup()` mock'lanır. `termsAccepted` flag'i kontrol edilerek guard logic test edilir.

---

## Features (Özellik) Testleri

### `features/cart/cart.spec.ts`

**Ne test eder:** Alışveriş sepeti bileşenini.

**Kapsam:**
- `footerCols` verisinin tanımlı olması
- `CartService` ve `ResponsiveService` inject edilmesi
- `formatPrice()`: Fiyat formatlama (virgüllü, dolar işaretli)
- Boş sepet durumu
- Ürün eklendiğinde sepet durumu
- Template: Navbar ve footer render edilmesi

**Nasıl çalışır:** `CartService` signal'ları ile mock'lanır. `formatPrice()` metodu farklı değerlerle test edilir.

---

### `features/chronos-ai/chronos-ai.spec.ts`

**Ne test eder:** AI sohbet asistanı bileşenini.

**Kapsam:**
- Başlangıç durumu (`inputText=''`, `isTyping=false`)
- Başlangıç mesajlarının yüklenmesi
- `onSend()`: Boş mesaj gönderilmemesi
- `onSend()`: Kullanıcı mesajının listeye eklenmesi
- `onSend()`: Input'un temizlenmesi
- `onSend()`: `isTyping=true` set edilmesi
- `onSend()`: 1.2 saniye sonra AI yanıtının gelmesi
- `onSuggestion()`: Öneri seçildiğinde mesaj gönderilmesi
- `onDetails()`: Saat detayı istendiğinde mesaj gönderilmesi
- AI yanıt eşleştirme: Vintage anahtar kelimesi için öneri listesi dönmesi
- AI yanıt eşleştirme: Bilinmeyen sorgu için fallback yanıt

**Nasıl çalışır:** `setTimeout` ile geciktirilmiş AI yanıtları `await new Promise(resolve => setTimeout(...))` ile beklenir.

---

### `features/deals/deals.spec.ts`

**Ne test eder:** Fırsatlar/indirimler sayfasını.

**Kapsam:**
- API'den ürün yüklenmesi (slice(4, 10) ile 6 ürün)
- Saat verisinin doğru yapıya map'lenmesi
- `originalPrice`'ın `unitPrice * 1.2` olarak hesaplanması
- `onSubscribe()`: Email temizlenmesi
- `onSubscribe()`: Boş email ile işlem yapılmaması
- Template: Navbar ve footer render edilmesi

**Nasıl çalışır:** `ApiService.getProducts()` 10 mock ürünle mock'lanır. Bileşen bunların 4-10 arasındakileri kullanır.

---

### `features/home/home.spec.ts`

**Ne test eder:** Ana sayfa bileşenini.

**Kapsam:**
- API'den ilk 3 ürünün yüklenmesi
- Ürün yapısının doğruluğu (name, price, slug, image)
- Düşük stoklu ürünlerin `limited=true` olarak işaretlenmesi
- `onDiscoverMore()`: `/collection` rotasına yönlendirme
- `onViewHeritage()`: `/deals` rotasına yönlendirme
- `onNewsletterSubmit()`: Email temizlenmesi
- `onQuickView()`: Hata fırlatmaması
- Template: Navbar ve footer render edilmesi

**Nasıl çalışır:** `ApiService` mock'lanır. `stockQuantity < 5` olan ürünler `limited=true` olarak işaretlenir, bu davranış test edilir.

---

### `features/product-detail/product-detail.spec.ts`

**Ne test eder:** Ürün detay sayfasını.

**Kapsam:**
- API'den ürün yüklenmesi (`ActivatedRoute` param'ı ile)
- API hatası durumunda fallback ürüne düşülmesi
- `openReviewModal()`: `showReviewForm=true` ve body scroll engellenmesi
- `closeReviewModal()`: `showReviewForm=false` ve body scroll geri yüklenmesi
- `setRating()`: Rating değerinin güncellenmesi (1-5)
- `submitReview()`: Eksik alanlarla gönderim yapılmaması
- `submitReview()`: Tüm alanlar doluyken yorum eklenmesi
- `submitReview()`: Form alanlarının temizlenmesi
- `submitReview()`: Rating'in 5'e sıfırlanması
- `addToCart()`: CartService.add() çağrılması
- `addToCart()`: Ürün null iken çağrı yapılmaması

**Nasıl çalışır:** `ActivatedRoute` mock'lanarak `paramMap` observable'ı simüle edilir. `CartService.add` spy ile izlenir.

---

## Member (Üye) Testleri

### `features/member/addresses/addresses.spec.ts`

**Ne test eder:** Adresler sayfasını.

**Kapsam:**
- Bileşenin oluşturulması
- Template'in render edilmesi

**Nasıl çalışır:** Basit bir bileşen olduğu için sadece oluşturma ve render testleri yapılır.

---

### `features/member/payments/payments.spec.ts`

**Ne test eder:** Ödemeler sayfasını.

**Kapsam:**
- Bileşenin oluşturulması
- Template'in render edilmesi

---

### `features/member/vault/vault.spec.ts`

**Ne test eder:** Kasa (vault) sayfasını.

**Kapsam:**
- Bileşenin oluşturulması
- Template'in render edilmesi

**Özel durum:** `LazyLoadDirective` kullandığı için `IntersectionObserver` mock'lanır.

---

### `features/member/dashboard/dashboard.spec.ts` *(mevcut)*

**Ne test eder:** Kullanıcı dashboard'unu.

**Kapsam:**
- Sidebar navigation link'lerinin tanımlı olması
- Doğru link yapısının (label, route, icon) kontrol edilmesi
- Sidebar bileşeninin render edilmesi

---

### `features/member/order-history/order-history.spec.ts` *(mevcut)*

**Ne test eder:** Sipariş geçmişi sayfasını.

**Kapsam:**
- Sipariş verilerinin yüklenmesi
- `isMobile` signal'ının tanımlı olması
- `openTracking()`: Modal açılması
- `closeTracking()`: Modal kapanması
- Sipariş yapısının doğruluğu

---

### `features/member/settings/settings.spec.ts` *(mevcut)*

**Ne test eder:** Ayarlar sayfasının responsive layout'unu.

**Kapsam:**
- Form alanlarının grid layout'u
- Mobil/desktop form düzeni
- Buton genişlikleri
- Touch target boyutları

---

## Admin Testleri

### `features/member/admin/admin.spec.ts`

**Ne test eder:** Admin dashboard ana sayfasını.

**Kapsam:**
- `systemStats` verisinin tanımlı olması ve doğru yapısı
- `recentActivity` verisinin tanımlı olması ve doğru yapısı
- Template: Navbar render edilmesi

---

### `features/member/admin/global-config/global-config.spec.ts`

**Ne test eder:** Platform genel ayarları sayfasını.

**Kapsam:**
- `saved` signal'ının başlangıçta `false` olması
- Platform, ödeme, güvenlik ve bildirim config'lerinin tanımlı olması
- `save()`: `saved=true` set edilmesi
- `save()`: 3 saniye sonra `saved=false`'a dönmesi (fake timer ile)

**Nasıl çalışır:** `vi.useFakeTimers()` ile `setTimeout` kontrol altına alınır, `vi.advanceTimersByTime(3000)` ile zaman ileri sarılır.

---

### `features/member/admin/platform-analytics/platform-analytics.spec.ts`

**Ne test eder:** Platform analitik sayfasını.

**Kapsam:**
- `activeYear` signal'ının başlangıç değeri
- Yıl listesi, KPI'lar, kullanıcı dağılımı, mağaza verileri
- `currentMonths` getter'ının doğru yıl verisini döndürmesi
- `setYear()`: Yıl değiştirme

---

### `features/member/admin/store-management/store-management.spec.ts`

**Ne test eder:** Mağaza yönetimi sayfasını.

**Kapsam:**
- Mağaza verisinin tanımlı olması ve doğru yapısı
- `toggleStatus()`: Açık mağazayı kapatma
- `toggleStatus()`: Kapalı mağazayı açma
- `toggleStatus()`: Diğer mağazaları etkilememesi
- `setMaintenance()`: Bakım moduna alma
- `setMaintenance()`: Diğer mağazaları etkilememesi

---

### `features/member/admin/user-management/user-management.spec.ts`

**Ne test eder:** Kullanıcı yönetimi sayfasını.

**Kapsam:**
- `searchQuery`, `filterRole` başlangıç değerleri
- `filtered` computed: Tüm kullanıcıları döndürme
- `filtered` computed: İsme göre filtreleme
- `filtered` computed: Email'e göre filtreleme
- `filtered` computed: Role göre filtreleme
- `filtered` computed: Arama + rol filtresi kombinasyonu
- `updateStatus()`: Kullanıcı durumu güncelleme
- `updateStatus()`: Seçili kullanıcı durumunu güncelleme
- `updateRole()`: Kullanıcı rolü güncelleme

---

## Corporate (Kurumsal) Testleri

### `features/member/corporate/corporate.spec.ts`

**Ne test eder:** Kurumsal dashboard ana sayfasını.

**Kapsam:**
- `corporateLinks` navigation link'lerinin tanımlı olması
- Doğru route'ların bulunması (/corporate, /corporate/inventory, vb.)
- `monthlySales` verisinin 12 ay içermesi
- `topProducts` ve `recentOrders` verilerinin tanımlı olması
- Template: Navbar ve sidebar render edilmesi

---

### `features/member/corporate/analytics/analytics.spec.ts`

**Ne test eder:** Kurumsal analitik sayfasını.

**Kapsam:**
- `activeYear` başlangıç değeri
- Yıl listesi, ürünler, kategoriler, KPI'lar
- `currentMonths` getter'ı
- `setYear()`: Yıl değiştirme
- `formatPrice()`: Fiyat formatlama

---

### `features/member/corporate/corp-settings/corp-settings.spec.ts`

**Ne test eder:** Kurumsal ayarlar sayfasını.

**Kapsam:**
- `saved` signal başlangıç değeri
- Mağaza, bildirim ve güvenlik config'lerinin tanımlı olması
- `saveSettings()`: `saved=true` set edilmesi
- `saveSettings()`: 3 saniye sonra `saved=false`'a dönmesi

---

### `features/member/corporate/customers/customers.spec.ts`

**Ne test eder:** Müşteri yönetimi sayfasını.

**Kapsam:**
- `searchQuery`, `filterTier` başlangıç değerleri
- `selectedCustomer` başlangıçta null
- Müşteri verisinin doğru yapısı
- `filtered` computed: İsme, email'e, konuma göre filtreleme
- `filtered` computed: Tier'a göre filtreleme
- `filtered` computed: Arama + tier kombinasyonu
- `formatPrice()`: Fiyat formatlama

---

### `features/member/corporate/inventory/inventory.spec.ts` *(mevcut)*

Envanter yönetimi sayfasının testleri.

---

### `features/member/corporate/orders/orders.spec.ts` *(mevcut)*

Kurumsal sipariş yönetimi sayfasının testleri.

---

## Shared (Paylaşılan) Testleri

### `shared/navbar/navbar.spec.ts` *(mevcut)*

**Ne test eder:** Navbar bileşeninin mobil menü yönetimini.

**Kapsam:**
- `mobileMenuOpen` signal başlangıç değeri
- `isMobile` computed signal'ı
- `toggleMobileMenu()`: Menü açma/kapama
- Body scroll engelleme/geri yükleme
- Viewport resize'da menünün otomatik kapanması

---

### `shared/footer/footer.spec.ts` *(mevcut)*

Footer bileşeninin testleri.

---

### `shared/sidebar/sidebar.spec.ts` *(mevcut)*

Sidebar bileşeninin testleri.

---

### `shared/directives/lazy-load.directive.spec.ts` *(mevcut)*

Lazy loading directive'inin testleri.

---

### `shared/directives/responsive.directive.spec.ts` *(mevcut)*

Responsive directive'inin testleri.

---

## Collection Testleri

### `features/collection/collection.spec.ts` *(mevcut)*

**Ne test eder:** Koleksiyon sayfasının responsive ürün grid'ini.

**Kapsam:**
- API'den ürün yüklenmesi
- Ürün grid'inin render edilmesi
- Arama filtresi

---

## Servis Testleri

### `core/services/responsive.service.spec.ts` *(mevcut)*

`ResponsiveService`'in viewport değişikliklerine tepkisini test eder.

---

## Genel Test Kalıpları

### IntersectionObserver Mock'u

`LazyLoadDirective` kullanan bileşenler jsdom ortamında `IntersectionObserver` bulamaz. Bu yüzden test dosyasının başına şu mock eklenir:

```typescript
if (typeof IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      setTimeout(() => {
        this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as any);
      }, 0);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    get root() { return null; }
    get rootMargin() { return ''; }
    get thresholds() { return []; }
  };
}
```

### Servis Mock'lama

```typescript
const mockAuthService = {
  currentUser: signal(null),
  isLoggedIn: () => false,
  initials: () => '',
  logout: () => {}
};

{ provide: AuthService, useValue: mockAuthService }
```

### Fake Timer Kullanımı

`setTimeout` içeren metodları test etmek için:

```typescript
vi.useFakeTimers();
component.save();
vi.advanceTimersByTime(3000);
expect(component.saved()).toBe(false);
vi.useRealTimers();
```

### Async Test (Gerçek Zamanlayıcı)

```typescript
it('should add AI response after delay', async () => {
  component.inputText = 'test';
  component.onSend();
  await new Promise(resolve => setTimeout(resolve, 1300));
  fixture.detectChanges();
  expect(component.isTyping).toBe(false);
});
```
