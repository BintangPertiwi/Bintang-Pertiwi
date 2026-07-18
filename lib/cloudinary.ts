import crypto from "crypto";
import "server-only";

export async function deleteFromCloudinary(secureUrl: string, resourceType: string = "image"): Promise<boolean> {
  if (!secureUrl || !secureUrl.includes("cloudinary.com")) return false;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary API credentials missing. Cannot delete image.");
    return false;
  }

  try {
    const uploadIndex = secureUrl.indexOf("/upload/");
    if (uploadIndex === -1) return false;
    
    const afterUpload = secureUrl.substring(uploadIndex + 8);
    const versionMatch = afterUpload.match(/^v\d+\//);
    const pathWithoutVersion = versionMatch ? afterUpload.substring(versionMatch[0].length) : afterUpload;

    // Untuk resource "raw" (dokumen Office), ekstensi adalah bagian dari public_id
    // sehingga TIDAK boleh dipangkas. Untuk "image", ekstensi dibuang seperti biasa.
    let publicId = pathWithoutVersion;
    if (resourceType !== "raw") {
      const lastDotIndex = pathWithoutVersion.lastIndexOf(".");
      publicId = lastDotIndex !== -1 ? pathWithoutVersion.substring(0, lastDotIndex) : pathWithoutVersion;
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.result === "ok";
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return false;
  }
}

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export async function getCloudinaryResources(): Promise<CloudinaryResource[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary API credentials missing.");
  }

  const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
  const allResources: CloudinaryResource[] = [];
  let nextCursor = "";

  try {
    do {
      let url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`;
      if (nextCursor) {
        url += `&next_cursor=${encodeURIComponent(nextCursor)}`;
      }
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch resources: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.resources && Array.isArray(data.resources)) {
        allResources.push(...data.resources);
      }
      
      nextCursor = data.next_cursor || "";
    } while (nextCursor);

    return allResources;
  } catch (error) {
    console.error("Failed to get Cloudinary resources:", error);
    return [];
  }
}

export async function getStorageUsage(): Promise<number> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return 0;
  }

  const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      next: { revalidate: 3600, tags: ["cloudinary-storage"] },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return 0;
    }

    const data = await res.json();
    return data?.storage?.usage || 0;
  } catch (error) {
    console.error("Failed to fetch storage usage:", error);
    return 0;
  }
}
