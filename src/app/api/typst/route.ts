import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";

function getTypstCommand(): string {
  try {
    // 1. Direct native binary from @flukxr/typst-cli (0.15.1)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const typstCli = require("@flukxr/typst-cli");
    if (typstCli?.typstPath && existsSync(typstCli.typstPath)) {
      return `"${typstCli.typstPath}"`;
    }
  } catch {}

  // 2. Local node_modules/.bin/typst
  const localBin = path.join(process.cwd(), "node_modules", ".bin", "typst");
  if (existsSync(localBin)) {
    return `"${localBin}"`;
  }

  // 3. Fallback to npx with the specific @flukxr/typst-cli package
  // Note: NEVER use plain `npx typst` as npm has a legacy unmaintained package `typst@0.10.0-8`
  return "npx --yes @flukxr/typst-cli";
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "typst-"));
    const typstFile = path.join(tempDir, "main.typ");
    const pdfFile = path.join(tempDir, "main.pdf");

    // Write the code to the typst file
    await fs.writeFile(typstFile, code, "utf8");

    // Compile the typst file
    // In Vercel, the default npm cache dir and typst package dir (~/.cache/typst) are read-only.
    // We point both to /tmp using environment variables.
    const typstBin = getTypstCommand();
    const cmd = `XDG_CACHE_HOME=/tmp/.cache XDG_DATA_HOME=/tmp/.data npm_config_cache=/tmp/.npm ${typstBin} compile "${typstFile}" "${pdfFile}"`;

    return new Promise<NextResponse>((resolve) => {
      exec(
        cmd,
        {
          env: {
            ...process.env,
            XDG_CACHE_HOME: "/tmp/.cache",
            XDG_DATA_HOME: "/tmp/.data",
            npm_config_cache: "/tmp/.npm",
            PATH: `${path.join(process.cwd(), "node_modules", ".bin")}:${process.env.PATH || ""}`,
          },
        },
        async (error, stdout, stderr) => {
          if (error) {
            // Read any compilation errors
            const errorMsg = stderr || error.message;
            // Clean up
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
            resolve(
              NextResponse.json({ error: errorMsg }, { status: 400 })
            );
            return;
          }

          try {
            // Read the generated PDF
            const pdfBuffer = await fs.readFile(pdfFile);

            // Clean up
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

            // Return the PDF
            resolve(
              new NextResponse(pdfBuffer, {
                status: 200,
                headers: {
                  "Content-Type": "application/pdf",
                  "Content-Disposition": 'inline; filename="cv.pdf"',
                },
              })
            );
          } catch (readError) {
            // Clean up
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
            resolve(
              NextResponse.json(
                { error: "Failed to read generated PDF" },
                { status: 500 }
              )
            );
          }
        }
      );
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
