// Sumber tunggal untuk secret JWT. Fail-closed di produksi:
// jika JWT_SECRET tidak di-set / terlalu pendek, verifikasi & sign harus GAGAL,
// bukan diam-diam memakai secret yang diketahui publik.

let cached: Uint8Array | null = null;

const DEV_FALLBACK = "dev-only-insecure-secret-change-me-32chars-min!!";

export function getJwtSecret(): Uint8Array {
  if (cached) return cached;

  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET tidak di-set atau kurang dari 32 karakter. Set secret acak yang kuat di environment."
      );
    }
    // Hanya untuk pengembangan lokal — tidak pernah dipakai di produksi.
    console.warn("[auth] JWT_SECRET belum di-set; memakai secret dev sementara (tidak aman untuk produksi).");
    cached = new TextEncoder().encode(DEV_FALLBACK);
    return cached;
  }

  cached = new TextEncoder().encode(secret);
  return cached;
}
