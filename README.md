# Sistem Informasi Geografis & Profil Bintang Pertiwi

Ini adalah web profil dan dashboard CMS untuk Bintang Pertiwi. Dibangun dengan pendekatan Zero-Cost menggunakan Next.js (App Router), Google Sheets API (Headless CMS), dan Cloudinary (Media Storage).

## 🚀 Getting Started (Local Development)

Proyek ini memanfaatkan **Vercel Environments** sebagai *Single Source of Truth* untuk mengelola kredensial dan environment variables. 

Dengan setup ini, kita tidak perlu membagikan file `.env` secara manual. Semua ditarik langsung dengan aman dari Vercel!

### Prasyarat

Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18.x ke atas)
- [Vercel CLI](https://vercel.com/docs/cli)

Instal Vercel CLI secara global (jika belum):
```bash
npm i -g vercel
```

### Langkah Setup Lokal

1. **Clone repository dan install dependencies:**
   ```bash
   npm install
   ```

2. **Hubungkan ke project Vercel (Vercel Link):**
   ```bash
   vercel link
   ```
   *Anda akan diminta login ke akun Vercel yang memiliki akses ke project ini, kemudian ikuti instruksi untuk menghubungkan direktori ini ke project yang ada di Vercel.*

3. **Tarik Environment Variables:**
   ```bash
   npm run env:pull
   ```
   *Perintah ini akan menjalankan `vercel env pull .env.local` dan mengunduh variabel dari environment **Development** Vercel ke komputer Anda.*

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
Dashboard admin dapat diakses di `/admin`.

---

## 🌍 Vercel Environments (Workflow)

Proyek ini memiliki 3 tahapan (environments) yang terpusat di Vercel:

1. **Development (Lokal):**
   - Variabel yang digunakan khusus untuk Anda kembangkan di komputer lokal.
   - Cara ambil: `npm run env:pull`.

2. **Preview (Staging / Uji Coba):**
   - Setiap kali Anda melakukan `git push` ke branch selain `main` (misal: `fitur-a`), Vercel akan membuat URL sementara (*Preview Deployment*).
   - Berguna untuk tes QA/Review tanpa merusak data *Production*.

3. **Production (Live):**
   - Terjadi saat branch di-merge ke `main`.
   - Menggunakan environment variables khusus *Production*.

## 🛠️ Stack & Panduan Lengkap

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui.
- **Backend / CMS**: Google Sheets API, Route Handlers.
- **Media**: Cloudinary.

Baca [Dokumentasi Proyek Lengkap (PRD)](md/prd.MD) dan peraturan pada file [AGENTS.md](AGENTS.md) untuk detail arsitektur, tipe data, serta aturan kode yang disepakati.
