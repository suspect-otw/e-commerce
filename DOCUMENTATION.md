# E-Commerce T-Shirt Project Documentation

## Genel Bakış

Bu proje, bir t-shirt e-ticaret web sitesi için admin paneli içerir. Next.js ve Supabase ile geliştirilmiştir. Kullanıcılar (sadece admin) giriş yapabilir ve ürünleri yönetebilir (CRUD işlemleri).

## Proje Yapısı

- **app/** - Next.js 15+ App Router yapısı
  - **app/actions/** - Server-side actions (CRUD operations)
  - **app/components/** - React bileşenleri
  - **app/protected/** - Sadece yetkili kullanıcıların erişebileceği sayfalar
- **utils/supabase/** - Supabase istemci ve sunucu bağlantıları
- **components/ui/** - shadcn/ui bileşenleri

## Kimlik Doğrulama (Authentication)

Kimlik doğrulama Supabase Authentication ile yönetilir.

- **app/actions.ts**: Giriş, çıkış, şifre sıfırlama gibi kimlik doğrulama işlemleri
- **app/(auth-pages)**: Giriş ve kayıt sayfaları 
- **app/protected/**: Yetkili kullanıcılar için korumalı alanlar

## Ürün Yönetimi (Product Management)

### 1. Ürün Listesi (Product List)

**Konum**: `app/components/ProductList.tsx`

Bu bileşen mevcut ürünleri tablo halinde gösterir. Özellikleri:

- Ürünlerin liste halinde görüntülenmesi
- Her ürün için düzenleme ve silme butonları
- Ürün silme işlemi için onay dialogu (shadcn/ui Alert Dialog ile)
- Resimlerin önizlemesi (birden fazla resim varsa sayı göstergesi)

**Kod Akışı**:
- `getProducts()` server action'ı ile tüm ürünler getirilir
- Düzenleme butonu: `onEdit` fonksiyonu ile düzenleme formunu açar
- Silme butonu: `deleteProduct` server action'ını çağırır (onay sonrası)

### 2. Ürün Formu (Product Form)

**Konum**: `app/components/ProductForm.tsx`

Yeni ürün ekleme ve mevcut ürünleri düzenleme için kullanılır. Özellikleri:

- Ürün bilgilerini (isim, boyut, fiyat) giriş alanları
- Çoklu resim yükleme desteği
- Yüklenen resimlerin grid görünümü
- Resimleri tek tek silme özelliği

**Kod Akışı**:
- `createProduct` veya `updateProduct` server action'larını çağırır
- Düzenleme modunda, silinen resimler storage'dan da silinir
- `handleRemoveImage` fonksiyonu, düzenleme modunda storage'dan da resimleri siler

### 3. Resim Yükleme (Image Upload)

**Konum**: `app/components/ImageUpload.tsx`

Resimleri Supabase Storage'a yüklemek için kullanılır. Özellikleri:

- Çoklu resim seçme desteği
- Yükleme sırasında ilerleme göstergesi
- Seçilen resimlerin önizlemesi

**Kod Akışı**:
- `uploadProductImage` server action'ını çağırır
- Yüklenen her resim için callback fonksiyonu çağrılır
- URL.createObjectURL ile geçici önizlemeler oluşturulur

## Server Actions

### 1. Ürün İşlemleri (Product Actions)

**Konum**: `app/actions/products.ts`

```typescript
// Ürün işlemleri için server actions
getProducts() // Tüm ürünleri getirir
getProduct(id) // Belirli bir ürünü getirir
createProduct(formData) // Yeni ürün oluşturur
updateProduct(formData) // Ürünü günceller
deleteProduct(id) // Ürünü ve ilişkili resimleri siler
```

**Önemli Noktalar**:
- Ürün silindiğinde, bağlı tüm resimler de Supabase Storage'dan silinir
- Ürün güncellendiğinde, kaldırılan resimler storage'dan silinir
- Her ürün için birden fazla resim depolanabilir (image_url string array olarak saklanır)

### 2. Depolama İşlemleri (Storage Actions)

**Konum**: `app/actions/storage.ts`

```typescript
// Depolama işlemleri için server actions
uploadProductImage(formData) // Resmi yükler ve URL döndürür
deleteProductImage(filePath) // Resmi storage'dan siler
```

**Önemli Noktalar**:
- Resimler UUID ile benzersiz isimlendirilir
- Tüm resimler 'product-images' bucket'ına yüklenir
- deleteProductImage hem tam URL hem de dosya adı alabiliyor

## Supabase Yapılandırması

### 1. Veritabanı Tabloları

**products tablosu**:
```sql
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    image_url TEXT[],
    price SMALLINT NOT NULL CHECK (price >= 1 AND price <= 10000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Storage Buckets

**product-images bucket**:
- Tüm ürün resimleri için depolama alanı
- RLS politikaları:
  - Herkes okuyabilir (public read)
  - Sadece yetkili kullanıcılar yazabilir, güncelleyebilir ve silebilir

## Ürün CRUD İşlem Akışı

### Ürün Ekleme
1. Admin korumalı sayfadan "Add New Product" butonuna tıklar
2. Ürün bilgilerini girer ve resimleri yükler
3. Her resim yüklendiğinde `uploadProductImage` çağrılır
4. Form gönderildiğinde `createProduct` server action'ı çağrılır
5. Ürün veritabanına kaydedilir

### Ürün Düzenleme
1. Admin ürün listesinden "Edit" butonuna tıklar
2. ProductForm açılır ve mevcut bilgiler gösterilir
3. Değişiklikler yapılır (resimler eklenebilir/silinebilir)
4. Silinen her resim için `deleteProductImage` çağrılır
5. Form gönderildiğinde `updateProduct` server action'ı çağrılır
6. Ürün veritabanında güncellenir

### Ürün Silme
1. Admin ürün listesinden "Delete" butonuna tıklar
2. Onay dialogu gösterilir
3. Onay verildiğinde `deleteProduct` server action'ı çağrılır
4. Ürün veritabanından silinir
5. Ürüne ait tüm resimler storage'dan silinir

## Geliştirme & Bakım İpuçları

1. **Yeni Özellik Eklemek İçin**:
   - Yeni bileşenler `app/components/` altına eklenebilir
   - Yeni server actions `app/actions/` altına eklenebilir

2. **UI Değişiklikleri**:
   - Tasarım değişiklikleri için `app/components/` altındaki ilgili bileşeni düzenleyin
   - Yeni shadcn/ui bileşenleri eklemek için: `npx shadcn-ui@latest add [component-name]`

3. **Veritabanı Değişiklikleri**:
   - Yeni tablolar veya alanlar eklemek için Supabase Dashboard'ı kullanın veya
   - SQL sorgularını `mcp_supabase_apply_migration` ile uygulayın

4. **Storage Yapılandırması**:
   - Bucket ayarları Supabase Dashboard üzerinden değiştirilebilir
   - RLS politikaları `app/actions/storage.ts` içinde referans alınabilir

5. **Hata Ayıklama**:
   - Server action hataları için console.error loglarını kontrol edin
   - Client-side hataları tarayıcı konsolunda görüntülenecektir

## Yaygın Sorunlar ve Çözümleri

1. **Resim Yükleme Sorunları**:
   - Supabase Storage bucket'ın doğru RLS politikalarına sahip olduğundan emin olun
   - `uploadProductImage` içindeki hata işleme kısmını kontrol edin

2. **Auth Sorunları**:
   - Supabase Auth ayarlarını kontrol edin
   - middleware.ts dosyasındaki yönlendirmeleri kontrol edin

3. **Yavaş Yükleme**:
   - Resim boyutlarını optimize edin
   - `ImageUpload` bileşenindeki resim yükleme işlemini kontrol edin 