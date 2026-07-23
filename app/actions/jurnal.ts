"use server";

import { updateTag } from "next/cache";

export async function expireJurnalCache() {
  updateTag("jurnal");
}
