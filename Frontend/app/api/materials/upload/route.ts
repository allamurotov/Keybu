import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// Where uploaded material files live on disk and the public URL prefix they're served under.
const UPLOAD_DIR = path.join(process.cwd(), "public", "upload", "materials");
const PUBLIC_PREFIX = "/upload/materials";

function safeFileName(originalName: string) {
  const ext = path.extname(originalName);
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 60);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${unique}-${base}${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = safeFileName(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

    return NextResponse.json({
      url: `${PUBLIC_PREFIX}/${fileName}`,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
    });
  } catch (err) {
    console.error("Material upload error:", err);
    return NextResponse.json({ error: "Faylni saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}