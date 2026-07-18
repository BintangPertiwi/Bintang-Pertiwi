const CLOUDINARY_UPLOAD_ENDPOINT = "https://api.cloudinary.com/v1_1";
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

interface CloudinaryUploadSuccessResponse {
  secure_url?: string;
}

interface CloudinaryUploadErrorResponse {
  error?: {
    message?: string;
  };
}

async function readCloudinaryError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const errorData = (await response.json()) as CloudinaryUploadErrorResponse;
    return errorData.error?.message || "Gagal mengunggah gambar ke Cloudinary";
  }

  return "Gagal mengunggah gambar ke Cloudinary";
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Konfigurasi Cloudinary belum diset di .env");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File yang diunggah harus berupa gambar.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Ukuran gambar maksimal 4 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`${CLOUDINARY_UPLOAD_ENDPOINT}/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readCloudinaryError(response));
  }

  const data = (await response.json()) as CloudinaryUploadSuccessResponse;
  if (!data.secure_url) {
    throw new Error("Cloudinary tidak mengembalikan URL gambar.");
  }

  return data.secure_url;
}

export async function deleteUploadedCloudinaryImage(secureUrl: string): Promise<void> {
  if (!secureUrl || !secureUrl.includes("cloudinary.com")) {
    return;
  }

  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secure_url: secureUrl }),
  });

  if (!response.ok) {
    throw new Error("Gagal menghapus file sementara dari Cloudinary.");
  }
}

// ===== Dokumen (PDF/Office) — bukan gambar =====

const MAX_DOC_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];

export interface DocumentUploadResult {
  url: string;
  resourceType: string; // "image" | "raw" (dari Cloudinary)
  tipe: string; // ekstensi, mis. "pdf"
}

export async function uploadDocumentToCloudinary(file: File): Promise<DocumentUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Konfigurasi Cloudinary belum diset di .env");
  }

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_DOC_EXT.includes(ext)) {
    throw new Error("Tipe file tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, atau txt.");
  }
  if (file.size > MAX_DOC_SIZE_BYTES) {
    throw new Error("Ukuran dokumen maksimal 15 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  // "auto" agar Cloudinary menentukan resource_type (PDF=image, Office=raw).
  const response = await fetch(`${CLOUDINARY_UPLOAD_ENDPOINT}/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readCloudinaryError(response));
  }

  const data = (await response.json()) as {
    secure_url?: string;
    resource_type?: string;
    format?: string;
  };
  if (!data.secure_url) {
    throw new Error("Cloudinary tidak mengembalikan URL dokumen.");
  }

  return {
    url: data.secure_url,
    resourceType: data.resource_type || "raw",
    tipe: (data.format || ext).toLowerCase(),
  };
}

export async function deleteUploadedCloudinaryFile(secureUrl: string, resourceType: string): Promise<void> {
  if (!secureUrl || !secureUrl.includes("cloudinary.com")) {
    return;
  }

  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secure_url: secureUrl, resource_type: resourceType }),
  });

  if (!response.ok) {
    throw new Error("Gagal menghapus file sementara dari Cloudinary.");
  }
}
