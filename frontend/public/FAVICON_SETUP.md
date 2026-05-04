# Favicon Setup Instructions

## Saat Görselini Favicon Olarak Kullanma

### Adım 1: Görseli Hazırlayın
Saat görselini (mavi saat ikonu) bilgisayarınıza kaydedin.

### Adım 2: Favicon Generator Kullanın (Önerilen)

1. **https://realfavicongenerator.net/** adresine gidin
2. Saat görselini yükleyin
3. Ayarları yapın:
   - iOS: "Add a solid, plain background color" seçin → Renk: `#1c1c19`
   - Android Chrome: "Use a solid color" → Renk: `#1c1c19`
   - Windows Metro: "Use a solid color" → Renk: `#1c1c19`
4. "Generate your Favicons and HTML code" butonuna tıklayın
5. İndirilen dosyaları `frontend/public/` klasörüne kopyalayın

### Adım 3: Gerekli Dosyalar

Aşağıdaki dosyalar `frontend/public/` klasöründe olmalı:

```
frontend/public/
├── favicon.ico (16x16, 32x32, 48x48)
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png (180x180)
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest (✅ Zaten oluşturuldu)
```

### Adım 4: Manuel Oluşturma (Alternatif)

Eğer manuel olarak oluşturmak isterseniz:

1. **Photoshop/GIMP/Figma** ile saat görselini açın
2. Aşağıdaki boyutlarda PNG olarak export edin:
   - `favicon-16x16.png` → 16x16 piksel
   - `favicon-32x32.png` → 32x32 piksel
   - `apple-touch-icon.png` → 180x180 piksel
   - `android-chrome-192x192.png` → 192x192 piksel
   - `android-chrome-512x512.png` → 512x512 piksel

3. **ICO dosyası oluşturun:**
   - https://www.icoconverter.com/ adresine gidin
   - 32x32 PNG'yi yükleyin
   - `favicon.ico` olarak indirin

### Adım 5: Test Edin

1. Dosyaları `frontend/public/` klasörüne kopyalayın
2. Angular dev server'ı yeniden başlatın: `npm start`
3. Tarayıcıda `http://localhost:4200` açın
4. Tarayıcı sekmesinde saat ikonunu görmelisiniz

### Hızlı Test

Tarayıcı konsolunda:
```javascript
console.log(document.querySelector('link[rel="icon"]').href);
```

## Renk Paleti

CHRONOS brand renkleri:
- **Primary Dark**: `#1c1c19` (Koyu gri - arka plan)
- **Primary Blue**: `#3b82f6` (Mavi - vurgular)
- **Surface**: `#ffffff` (Beyaz)

## Notlar

- ✅ `site.webmanifest` zaten oluşturuldu
- ✅ `index.html` favicon linkleri güncellendi
- ⏳ Sadece görsel dosyalarını eklemeniz gerekiyor

## Hızlı Çözüm

Eğer hızlı bir çözüm istiyorsanız, şimdilik mevcut `favicon.ico` dosyasını kullanabilirsiniz. Daha sonra saat görseli ile değiştirebilirsiniz.
