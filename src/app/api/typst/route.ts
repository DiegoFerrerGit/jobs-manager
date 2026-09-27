import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

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
    // We use the node_modules/.bin/typst wrapper
    return new Promise<NextResponse>((resolve) => {
      exec(
        `npx typst compile "${typstFile}" "${pdfFile}"`,
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
