import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { cvJson, filename } = await req.json();

  const timestamp = Date.now();
  const jsonFilename = `cv_${timestamp}.json`;
  const docxFilename = filename || `CV_${timestamp}.docx`;

  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const jsonPath = path.join(tmpDir, jsonFilename);
  const docxPath = path.join(tmpDir, docxFilename);
  const scriptPath = path.join(process.cwd(), "scripts", "generate_cv.py");

  // Write JSON to temp file
  fs.writeFileSync(jsonPath, JSON.stringify(cvJson, null, 2), "utf-8");

  return new Promise<NextResponse>((resolve) => {
    const proc = spawn("python3", [scriptPath, jsonPath, "--output", docxPath]);

    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", (code) => {
      // Clean up JSON immediately
      try {
        fs.unlinkSync(jsonPath);
      } catch {}

      if (code !== 0) {
        resolve(
          NextResponse.json(
            { error: `Script failed: ${stderr}` },
            { status: 500 }
          )
        );
        return;
      }

      // Schedule .docx cleanup after 10 minutes
      setTimeout(() => {
        try {
          if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
        } catch {}
      }, 10 * 60 * 1000);

      resolve(
        NextResponse.json({
          downloadUrl: `/api/download/${encodeURIComponent(docxFilename)}`,
          filename: docxFilename,
        })
      );
    });

    proc.on("error", (err) => {
      try {
        fs.unlinkSync(jsonPath);
      } catch {}
      resolve(
        NextResponse.json(
          { error: `Failed to run Python script: ${err.message}` },
          { status: 500 }
        )
      );
    });
  });
}
