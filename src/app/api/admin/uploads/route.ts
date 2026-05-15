import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      {
        error: "Configura CLOUDINARY_CLOUD_NAME y CLOUDINARY_UPLOAD_PRESET para subir imagenes."
      },
      { status: 501 }
    );
  }

  const form = await request.formData();
  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!files.length) {
    return NextResponse.json({ error: "No se recibieron imagenes." }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", uploadPreset);
    cloudinaryForm.append("folder", "danatto/products");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
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
