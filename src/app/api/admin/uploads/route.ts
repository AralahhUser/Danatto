import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const maxFileSize = 4.5 * 1024 * 1024;

export async function POST(request: Request) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!blobToken && (!cloudName || !uploadPreset)) {
    return NextResponse.json(
      {
        error: "Configura Vercel Blob o Cloudinary para subir imagenes."
      },
      { status: 501 }
    );
  }

  const form = await request.formData();
  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!files.length) {
    return NextResponse.json({ error: "No se recibieron imagenes." }, { status: 400 });
  }

  const invalidFile = files.find((file) => !file.type.startsWith("image/"));
  if (invalidFile) {
    return NextResponse.json({ error: "Solo se permiten archivos de imagen." }, { status: 400 });
  }

  const oversizedFile = files.find((file) => file.size > maxFileSize);
  if (oversizedFile) {
    return NextResponse.json({ error: "Cada imagen debe pesar menos de 4.5 MB." }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (blobToken) {
      const blob = await put(`danatto/products/${safeFileName(file.name)}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type
      });
      urls.push(blob.url);
      continue;
    }

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", uploadPreset!);
    cloudinaryForm.append("folder", "danatto/products");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName!}/image/upload`, {
      method: "POST",
      body: cloudinaryForm
    });

    if (!response.ok) {
      return NextResponse.json({ error: "No se pudo subir una imagen." }, { status: 502 });
    }

    const data = (await response.json()) as { secure_url?: string };
    if (data.secure_url) urls.push(data.secure_url);
  }

  return NextResponse.json({ urls });
}

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() || "jpg";
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "producto"}.${extension}`;
}
