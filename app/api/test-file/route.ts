// app/api/test-file/route.ts
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  console.log("EMAIL:", process.env.GOOGLE_CLIENT_EMAIL);
  console.log("PRIVATE KEY:", process.env.GOOGLE_PRIVATE_KEY);
  console.log(
    "GOOGLE_APPLICATION_CREDENTIALS:",
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  const keyPath = path.resolve(
    process.cwd(),
    "banded-nimbus-454510-k7-57997bb68c99.json"
  );

  try {
    const content = fs.readFileSync(keyPath, "utf8");
    return NextResponse.json({
      exists: true,
      firstChars: content.slice(0, 50),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        cwd: process.cwd(),
        resolvedPath: keyPath,
      },
      { status: 500 }
    );
  }
}
