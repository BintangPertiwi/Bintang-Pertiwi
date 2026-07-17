import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function main() {
  const { db } = await import("../lib/db");
  const { adminAuth } = await import("../lib/db/schema");
  const bcrypt = (await import("bcryptjs")).default;
  const { sql } = await import("drizzle-orm");

  const args = process.argv.slice(2);
  const username = args[0] || process.env.ADMIN_USERNAME;
  const password = args[1] || process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("❌ Error: Username dan password harus disertakan via argumen CLI atau di-set di file .env (ADMIN_USERNAME & ADMIN_PASSWORD)");
    process.exit(1);
  }

  console.log(`Menyiapkan kredensial untuk username: "${username}"`);
  console.log(`Mohon tunggu, sedang menghash password...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    console.log("Menghubungkan ke Turso DB...");

    await db.insert(adminAuth)
      .values({ username, password: hashedPassword, role: "super_admin" })
      .onConflictDoUpdate({
        target: adminAuth.username,
        set: { password: sql`excluded.password` }
      });

    console.log("✅ Berhasil menyimpan kredensial (hashed) ke Turso DB!");
    console.log(`Silakan gunakan password "${password}" untuk login.`);
  } catch (error) {
    console.error("❌ Gagal menyimpan ke Turso DB:", error);
  }
}

main();
