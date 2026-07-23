import { SignJWT, importPKCS8 } from "jose";

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error("Missing Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY)");
  }

  // Handle newlines in private key
  privateKey = privateKey.replace(/\\n/g, '\n');

  const alg = "RS256";
  const pkey = await importPKCS8(privateKey, alg);

  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/drive",
  })
    .setProtectedHeader({ alg })
    .setIssuer(email)
    .setSubject(email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(pkey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to exchange JWT for access token: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function makeFilePublic(fileId: string, accessToken: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to make Google Drive file public: ${errText}`);
  }
}

export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const accessToken = await getAccessToken();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Metadata describing the file upload
  const metadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  const boundary = "boundary_multipart_upload_nota";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaPartHeader = `Content-Type: ${mimeType}\r\n\r\n`;

  // Combine metadata and file buffer into multipart payload
  const body = Buffer.concat([
    Buffer.from(delimiter),
    Buffer.from(metadataPart),
    Buffer.from(delimiter),
    Buffer.from(mediaPartHeader),
    fileBuffer,
    Buffer.from(closeDelimiter),
  ]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": body.length.toString(),
      },
      body,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload file to Google Drive API: ${errText}`);
  }

  const data = await res.json();
  const fileId = data.id;

  // Make the file public reader:anyone so it can be loaded directly in <img> tags
  await makeFilePublic(fileId, accessToken);

  // Return the direct display thumbnail URL or lh3.googleusercontent.com URL
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}
