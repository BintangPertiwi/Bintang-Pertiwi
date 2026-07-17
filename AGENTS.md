# Project Rules - Bintang Pertiwi

## 1. Konteks Proyek

Ini adalah **Sistem Informasi Geografis & Profil Dusun** untuk Bintang Pertiwi.

- **Tujuan utama**: Web profil desa + Dashboard CMS yang bisa dikelola oleh perangkat dusun.
- **Model biaya**: Rp 0 (Zero-Cost Maintenance). Tidak boleh ada layanan berbayar.
- **Arsitektur**: Serverless Jamstack — Turso (libSQL Edge DB) & Drizzle ORM sebagai Database, Cloudinary sebagai media storage, Vercel sebagai hosting.
- **PRD lengkap**: Baca `md/prd.MD` untuk spesifikasi fitur dan skema database.
- **Tiket kerja**: Semua task ada di `md/tasks/`.

## 2. Tech Stack (Wajib Dipatuhi)

| Layer            | Teknologi                                                     |
| :--------------- | :------------------------------------------------------------ |
| Framework        | **Next.js 16** (App Router) — perhatikan breaking changes!    |
| Bahasa           | **TypeScript** (strict mode, sudah di-set di `tsconfig.json`) |
| Styling          | **Tailwind CSS** dengan 8pt Grid System                       |
| UI Components    | **shadcn/ui** (Radix UI primitives + Tailwind styling)        |
| Backend/API      | Next.js Route Handlers (Serverless Functions)                 |
| Database/CMS     | Turso (libSQL Edge Database) + Drizzle ORM                    |
| Media Storage    | Cloudinary (Direct Client-Side Upload, unsigned preset)       |
| Rich Text Editor | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`)               |
| Auth             | JWT via `jose` library, disimpan di HTTP-only cookie          |
| Icons            | `lucide-react`                                                |
| Deployment       | Vercel                                                        |

## 3. Next.js 16 Breaking Changes (KRITIS!)

### 3.1 Proxy (bukan Middleware)

- **`middleware.ts` sudah DEPRECATED**. Gunakan `proxy.ts` di root project.
- Fungsi harus diekspor dengan nama `proxy`, bukan `middleware`:

  ```ts
  // ✅ BENAR (proxy.ts)
  export async function proxy(request: NextRequest) { ... }

  // ❌ SALAH (middleware.ts)
  export async function middleware(request: NextRequest) { ... }
  ```

- Proxy HANYA untuk redirect/rewrite/header manipulation. Jangan gunakan untuk data fetching atau session management yang berat.
- Referensi: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

### 3.2 Caching (`use cache` directive)

- Next.js 16 memperkenalkan `"use cache"` directive (memerlukan `cacheComponents: true` di `next.config.ts`).
- Gunakan `cacheLife()` untuk mengatur durasi cache (`'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`).
- Gunakan `cacheTag()` untuk memberi tag pada cache entry agar bisa di-invalidasi secara granular.
- On-demand revalidation:
  - `updateTag('tag')` — langsung expire cache (hanya di Server Actions).
  - `revalidateTag('tag', 'max')` — stale-while-revalidate (di Server Actions & Route Handlers).
  - `revalidatePath('/path')` — invalidasi berdasarkan path.
- Referensi: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`

### 3.3 Hal yang TIDAK boleh di `use cache`

- `cookies()`, `headers()`, `searchParams` — baca di luar scope cache, teruskan sebagai argumen.
- Class instances, functions (kecuali pass-through), Symbols, WeakMaps, WeakSets, URL instances.

## 4. TypeScript Best Practices (Wajib)

### 4.1 Dilarang Keras

- ❌ **JANGAN PERNAH** menggunakan tipe `any`. Selalu cari tahu dan definisikan **tipe data yang spesifik dan benar** (misalnya membuat `interface` atau `type` khusus). Penggunaan `unknown` hanya diizinkan untuk data yang benar-benar dinamis/tidak terprediksi dan WAJIB disertai _type narrowing_.
- ❌ Jangan gunakan `@ts-ignore` atau `@ts-expect-error` kecuali benar-benar tidak ada cara lain (dan harus diberi komentar mengapa).
- ❌ Jangan biarkan variabel tanpa tipe yang jelas pada function parameters dan return types.

### 4.2 Wajib Dilakukan

- ✅ Definisikan `interface` atau `type` untuk semua struktur data (props, API response, sheet row schema).
- ✅ Gunakan `interface` untuk object shapes dan `type` untuk unions/intersections.
- ✅ Buat file `types/` di root untuk tipe data yang dipakai lintas modul:
  ```
  types/
  ├── sheets.ts     # Tipe untuk row Google Sheets (BeritaRow, GaleriRow, dll.)
  ├── api.ts        # Tipe untuk API request/response
  └── index.ts      # Re-export semua
  ```
- ✅ Selalu gunakan `as const` untuk literal values yang tidak berubah.
- ✅ Gunakan generic types jika memungkinkan untuk fungsi helper yang reusable.

### 4.3 Contoh Tipe Data Sheets

```ts
// types/sheets.ts
export interface BeritaRow {
  id: string;
  judul: string;
  tanggal: string;
  ringkasan: string;
  isi_berita: string;
  url_foto: string;
}

export interface GaleriRow {
  id: string;
  kategori: string;
  caption: string;
  tanggal_upload: string;
  url_foto: string;
}
```

## 5. Struktur Folder & Komponen

### 5.1 Aturan Struktur

```
app/
├── (public)/           # Grup route publik (beranda, berita, galeri, kontak)
│   ├── layout.tsx
│   └── page.tsx
├── admin/              # Dashboard CMS (protected by proxy.ts)
│   ├── layout.tsx      # Sidebar + Topbar
│   ├── page.tsx        # Overview dashboard
│   ├── berita/
│   ├── galeri/
│   └── pengaturan/
├── login/
│   └── page.tsx
├── api/                # Route Handlers (serverless)
│   ├── auth/
│   ├── berita/
│   ├── galeri/
│   └── revalidate/
├── layout.tsx          # Root layout
└── globals.css
components/
├── ui/                 # Komponen UI primitif (Button, Card, Input, Modal, dll.)
├── admin/              # Komponen khusus dashboard (Sidebar, DataTable, dll.)
└── public/             # Komponen khusus halaman publik (HeroBanner, NewsCard, dll.)
lib/
├── db/                 # Koneksi Turso, schema Drizzle & queries
├── cloudinary.ts       # Helper upload Cloudinary
└── utils.ts            # Fungsi utilitas umum
types/                  # Definisi TypeScript interfaces/types
```

### 5.2 Aturan Komponen

- **Satu komponen = satu file**. Jangan menumpuk banyak komponen besar dalam satu file.
- **Pecah komponen** jika sudah melebihi ~150 baris. Buat sub-komponen.
- **`"use client"` hanya di komponen yang BENAR-BENAR butuh interaktivitas** (form, state, onClick, useEffect). Jangan taruh `"use client"` di level page atau layout kecuali terpaksa.
- **Server Components adalah DEFAULT**. Jadikan client component hanya komponen terkecil yang butuh state/event handlers.
- **Nama file**: `kebab-case.tsx` untuk komponen (contoh: `news-card.tsx`, `rich-text-editor.tsx`).
- **Nama komponen**: `PascalCase` (contoh: `NewsCard`, `RichTextEditor`).

### 5.3 Penggunaan shadcn/ui (Wajib)

- ❌ **JANGAN** menggunakan tag HTML mentah untuk elemen UI interaktif. Gunakan komponen **shadcn/ui** yang sudah tersedia:
  ```tsx
  // ❌ SALAH — tag HTML mentah
  <button className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
  <input type="text" className="border px-3 py-2 rounded" />
  <table><thead>...</thead></table>

  // ✅ BENAR — shadcn/ui components
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table";

  <Button>Simpan</Button>
  <Input placeholder="Masukkan judul" />
  <Table>...</Table>
  ```
- ✅ Komponen shadcn/ui yang WAJIB digunakan jika ada kebutuhan terkait:
  - **Form**: `Button`, `Input`, `Textarea`, `Select`, `Label`, `Checkbox`, `Switch`
  - **Data Display**: `Table`, `Card`, `Badge`, `Avatar`, `Separator`
  - **Overlay**: `Dialog` (bukan modal custom), `Sheet` (untuk sidebar mobile), `AlertDialog`
  - **Feedback**: `Toast`/`Sonner` (notifikasi), `Alert`, `Skeleton` (loading state)
  - **Navigation**: `Tabs`, `DropdownMenu`, `Breadcrumb`
- ✅ Install komponen shadcn sesuai kebutuhan menggunakan: `npx shadcn@latest add <component-name>`
- ✅ Komponen shadcn otomatis tersimpan di `components/ui/` dan boleh di-modifikasi sesuai kebutuhan.

## 6. API & Data Fetching Patterns

### 6.1 Database Interaction (Turso + Drizzle)

- Semua operasi ke database HARUS melalui **Data Access Layer (DAL)** di `lib/db/queries/` atau **Route Handlers** (`app/api/`) — JANGAN langsung panggil DB dari client component.
- Gunakan `lib/db/index.ts` sebagai satu-satunya entry point untuk inisialisasi Drizzle client.
- Setiap helper function yang mengakses database harus diberi tipe return yang eksplisit.

### 6.2 Pattern Read (Halaman Publik)

Halaman publik harus menggunakan cache agar tidak membombardir Turso API dan menghemat kuota read:

```ts
// lib/db/queries/berita.ts
import { cacheTag, cacheLife } from "next/cache";

export async function getBeritaList(): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita");
  cacheLife("hours");
  // ... fetch dari Turso via Drizzle
}
```

### 6.3 Pattern Write (Admin)

Setelah admin mengubah data, lakukan revalidasi:

```ts
// app/api/berita/route.ts
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  // ... simpan ke Turso DB
  revalidateTag("berita", "max");
  return NextResponse.json({ success: true });
}
```

### 6.4 Upload Gambar

- Upload gambar SELALU dilakukan dari sisi client langsung ke Cloudinary (Direct Upload).
- JANGAN upload melalui Route Handler/serverless function (batas 4.5MB payload, 10s timeout).
- Setelah upload, simpan URL Cloudinary ke Database melalui Route Handler.

### 6.5 Penghapusan & Penggantian Gambar (Auto-Delete)

- Wajib menghapus gambar lama dari server Cloudinary setiap kali ada aksi yang membuang gambar (misalnya saat menghapus baris data yang memiliki gambar, atau saat user mengganti gambar/meng-*update* entri dengan gambar baru).
- Penghapusan gambar menggunakan API Secret Cloudinary dan diproses *hanya* dari Server-Side (Route Handler) melalui fungsi utilitas `deleteFromCloudinary`.
- Dilarang meninggalkan *orphaned images* di Cloudinary untuk menjaga efisiensi ruang penyimpanan.

## 7. Responsivitas (Wajib)

### 7.1 Pendekatan

- **Mobile-first approach**. Style dasar untuk mobile, lalu scale up.
- Dashboard admin HARUS bisa digunakan di **mobile, tablet, DAN desktop** (sidebar collapsible).
- Setiap halaman dan komponen HARUS diuji di minimal 3 ukuran viewport: ~375px (mobile), ~768px (tablet), ~1280px (desktop).

### 7.2 Breakpoint Strategy — Gunakan Range (Min-Max)

- ❌ **JANGAN** hanya mengandalkan breakpoint tunggal seperti `md:`, `lg:` karena bisa meninggalkan celah (_gap_) di device tertentu (misal: tablet portrait 820px yang jatuh di antara `md` dan `lg`).
- ✅ **Gunakan range-based breakpoints** dengan `min-` dan `max-` di Tailwind untuk memastikan setiap ukuran layar ter-cover:
  ```css
  /* tailwind.config.ts — Contoh custom screens */
  screens: {
    'xs': '375px',               // Mobile kecil
    'sm': '480px',               // Mobile besar
    'md': '768px',               // Tablet portrait
    'lg': '1024px',              // Tablet landscape / laptop kecil
    'xl': '1280px',              // Desktop
    '2xl': '1536px',             // Desktop besar
    // Range-based breakpoints:
    'mobile': { 'max': '767px' },                    // 0 - 767px
    'tablet': { 'min': '768px', 'max': '1023px' },   // 768px - 1023px
    'desktop': { 'min': '1024px' },                   // 1024px+
  }
  ```
- ✅ Gunakan `@container` query (Tailwind `@container`) jika komponen harus responsif berdasarkan _parent container_ bukan viewport (misalnya card di dalam sidebar vs main content).
- ✅ Contoh penggunaan range:

  ```tsx
  // ✅ BENAR — cover semua range
  <div className="mobile:flex-col tablet:flex-row desktop:grid desktop:grid-cols-3">

  // ❌ SALAH — ada celah antara breakpoint
  <div className="flex-col md:flex-row lg:grid-cols-3">
  ```

- ✅ Gunakan `clamp()` untuk fluid typography dan spacing jika perlu:
  ```css
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  ```

## 8. Keamanan (Diperketat)

### 8.1 Kredensial & Environment Variables

- **Kredensial Turso (TURSO_AUTH_TOKEN, TURSO_DATABASE_URL)** HANYA boleh diakses di server-side (Route Handlers, Server Components). JANGAN PERNAH expose ke client.
- **Environment variables** tanpa prefix `NEXT_PUBLIC_` tidak akan terekspos ke browser — pastikan `TURSO_AUTH_TOKEN`, `JWT_SECRET` TIDAK mempunyai prefix tersebut.
- **JANGAN PERNAH** hardcode secret/key di dalam source code. Selalu baca dari `process.env`.
- **File `.env`** HARUS ada di `.gitignore`. Jangan pernah commit file ini.

### 8.2 Autentikasi & Sesi

- **JWT Secret** WAJIB di-set di `.env` (variabel `JWT_SECRET`). Di production, WAJIB menggunakan string acak minimal 32 karakter.
- **Token JWT** disimpan di HTTP-only cookie (bukan localStorage/sessionStorage) untuk mencegah XSS.
- **Cookie harus** di-set dengan flag: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`, dan `maxAge` yang wajar (24 jam).
- **Validasi token** di `proxy.ts` hanya bersifat _optimistic check_ (cepat). Untuk operasi sensitif (write/delete), SELALU validasi ulang token di dalam Route Handler.

### 8.3 Input Validation

- **SELALU validasi input** dari client di Route Handler sebelum menyimpan ke database.
- **Sanitize HTML** dari Tiptap editor sebelum menyimpan ke DB (cegah XSS jika data ditampilkan di halaman publik).
- **Batasi ukuran payload** request body. Tolak request yang body-nya melebihi batas wajar.
- **Validasi tipe data**: Jangan langsung percaya `request.json()` — lakukan type narrowing/validation.

### 8.4 Rate Limiting & Abuse Prevention

- Pertimbangkan rate limiting sederhana di Route Handler publik (misal: form submission publik) untuk mencegah spam.
- Endpoint login HARUS membatasi percobaan gagal berturut-turut (misal: delay response setelah 5x gagal).

## 9. Code Quality & Best Practices (Wajib)

### 9.1 DRY (Don't Repeat Yourself)

- ❌ **JANGAN** copy-paste blok kode yang sama di lebih dari satu tempat. Ekstrak ke fungsi helper atau komponen reusable.
- ✅ Buat helper functions di `lib/utils.ts` untuk logika yang dipakai di banyak tempat (misal: format tanggal, generate ID).
- ✅ Buat komponen UI reusable di `components/ui/` (misal: `Button`, `Input`, `Modal`, `DataTable`).
- ✅ Untuk _fetch patterns_ ke Database yang mirip (CRUD per tabel), buat DAL queries di `lib/db/queries/`:
  ```ts
  // lib/db/queries/berita.ts
  export async function getBeritaList(): Promise<BeritaRow[]> { ... }
  export async function appendBerita(data: BeritaRow): Promise<void> { ... }
  export async function deleteBeritaById(id: string): Promise<boolean> { ... }
  ```

### 9.2 Remove Unused Code

- ❌ **JANGAN** biarkan import yang tidak terpakai. Hapus segera.
- ❌ **JANGAN** biarkan variabel, fungsi, atau komponen yang tidak terpakai (_dead code_). Hapus, jangan hanya di-comment.
- ❌ **JANGAN** biarkan `console.log()` debugging di production code. Hanya `console.error()` untuk error logging di server-side yang boleh tetap ada.
- ✅ Jalankan `npx tsc --noEmit` sebelum commit untuk memastikan tidak ada error tipe.

### 9.3 Penamaan yang Konsisten

- **File**: `kebab-case` (contoh: `news-card.tsx`, `schema.ts`).
- **Komponen/Kelas**: `PascalCase` (contoh: `NewsCard`, `RichTextEditor`).
- **Variabel/Fungsi**: `camelCase` (contoh: `getBeritaList`, `handleDelete`).
- **Konstanta/Enum**: `UPPER_SNAKE_CASE` (contoh: `SPREADSHEET_ID`, `MAX_FILE_SIZE`).
- **Tipe/Interface**: `PascalCase` (contoh: `BeritaRow`, `ApiResponse`).

### 9.4 Barrel Exports

- Gunakan `index.ts` sebagai barrel export untuk folder `types/` dan `components/ui/`:
  ```ts
  // types/index.ts
  export type { BeritaRow, GaleriRow } from "./db";
  export type { ApiResponse } from "./api";
  ```

### 9.5 Komentar & Dokumentasi Kode

- ❌ **JANGAN** memberikan komentar yang berlebihan, redundan, atau tidak penting setiap kali mengedit atau membuat kode.
- ❌ **JANGAN** menjelaskan hal yang sudah sangat jelas terbaca dari kode itu sendiri (*self-documenting code*).
- ✅ Tulis komentar hanya untuk menjelaskan **"Mengapa"** (*business logic*, alasan keputusan teknis, atau *workaround* khusus), bukan **"Apa"** yang dilakukan oleh baris kode tersebut.

## 10. Next.js Best Practices (Wajib)

### 10.1 Server vs Client Components

- **Server Components adalah DEFAULT**. Jadikan client component hanya komponen terkecil yang butuh state/event handlers.
- **`"use client"` hanya di komponen yang BENAR-BENAR butuh interaktivitas** (form, state, onClick, useEffect).
- ❌ Jangan taruh `"use client"` di level `page.tsx` atau `layout.tsx` kecuali benar-benar terpaksa.
- ✅ Pattern: Buat wrapper client component kecil yang meng-import server component sebagai children.

### 10.2 Route Handlers

- Setiap Route Handler HARUS memiliki `try-catch` dan mengembalikan error response yang informatif.
- Gunakan `NextResponse.json({ message: '...' }, { status: 4xx/5xx })` untuk error responses.
- Log error menggunakan `console.error()` di server-side agar bisa di-debug di Vercel.
- Di client, tampilkan pesan error yang user-friendly (dalam Bahasa Indonesia).
- ❌ **JANGAN** melakukan data fetching berat di `proxy.ts`. Proxy hanya untuk redirect/rewrite.

### 10.3 Dynamic Imports & Code Splitting

- Gunakan `next/dynamic` untuk komponen berat yang tidak dibutuhkan saat initial load (misal: Tiptap Editor):
  ```ts
  const TiptapEditor = dynamic(() => import("@/components/tiptap-editor"), {
    ssr: false,
  });
  ```
- Ini mengurangi bundle size dan mempercepat First Contentful Paint.

### 10.4 Image Optimization

- Gunakan `next/image` untuk semua gambar. Jangan gunakan tag `<img>` biasa.
- Set `width`, `height`, atau `fill` yang eksplisit untuk mencegah layout shift (CLS).

### 10.5 Metadata & SEO

- Setiap halaman publik HARUS memiliki `metadata` export (atau `generateMetadata`) untuk title dan description.
- Gunakan format yang konsisten: `"Judul Halaman — SIG-Bintang Pertiwi"`.

## 11. Konvensi Bahasa

- **Kode (variabel, fungsi, tipe)**: Bahasa Inggris (`getBeritaList`, `BeritaRow`, `handleDelete`).
- **UI text / labels**: Bahasa Indonesia (sesuai target pengguna perangkat dusun).
- **Komentar kode**: Boleh Bahasa Indonesia untuk penjelasan bisnis logic, Bahasa Inggris untuk komentar teknis.
- **Nama Tabel/Kolom di Database**: Sesuai PRD, gunakan format `snake_case` (contoh: `berita_dusun`).
