import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { UTApi } from "uploadthing/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const identifier = getClientIdentifier(req, userId);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.uploadImage);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMITS.uploadImage.maxRequests),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetTime),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Try UploadThing first, fallback to local storage
    let imageUrl: string;

    try {
      // Upload to UploadThing with timeout
      const uploadPromise = utapi.uploadFiles(file);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 8000)
      );

      const response = await Promise.race([uploadPromise, timeoutPromise]) as Awaited<ReturnType<typeof utapi.uploadFiles>>;

      if (response.error) {
        throw new Error(response.error.message || "UploadThing upload failed");
      }

      imageUrl = response.data.url;
    } catch (uploadError) {
      // Fallback to local file storage

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(file.name) || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await fs.writeFile(filepath, buffer);

      imageUrl = `/uploads/${filename}`;
    }

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes("timeout") || errorMessage.includes("Connect")) {
      return NextResponse.json(
        { error: "Upload service is temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

