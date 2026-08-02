"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"];

export async function uploadDocument(formData: FormData) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });

    if (!session?.user) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };
    if (file.size > MAX_FILE_SIZE) return { error: "File too large. Maximum size is 10MB." };
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".md"))
      return { error: "Unsupported file type. Upload PDF, DOCX, TXT, or Markdown." };

    const fileType = file.name.endsWith(".md") ? "md" :
      file.type === "application/pdf" ? "pdf" :
      file.type.includes("wordprocessingml") ? "docx" : "txt";

    // Insert a processing record first so the UI can show it immediately
    const [doc] = await db.insert(documents).values({
      userId: session.user.id,
      name: file.name,
      fileType,
      fileSize: file.size,
      status: "processing",
    }).returning();

    // Extract text in the background
    extractTextFromDocument(doc.id, file, fileType).catch(console.error);

    revalidatePath("/library");
    return { success: true, documentId: doc.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload document." };
  }
}

async function extractTextFromDocument(docId: string, file: File, fileType: string) {
  try {
    let text = "";
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileType === "pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (fileType === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // txt or md
      text = buffer.toString("utf-8");
    }

    await db.update(documents)
      .set({ extractedText: text.slice(0, 500000), status: "ready" }) // cap at 500k chars
      .where(eq(documents.id, docId));
  } catch (err) {
    console.error("Text extraction failed:", err);
    await db.update(documents)
      .set({ status: "error" })
      .where(eq(documents.id, docId));
  }
}

export async function getDocuments() {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });

    if (!session?.user) return [];

    return await db.query.documents.findMany({
      where: eq(documents.userId, session.user.id),
      columns: { extractedText: false }, // Never send raw text to client
      orderBy: (docs, { desc }) => [desc(docs.createdAt)],
    });
  } catch {
    return [];
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });

    if (!session?.user) return { error: "Unauthorized" };

    await db.delete(documents).where(
      and(eq(documents.id, documentId), eq(documents.userId, session.user.id))
    );

    revalidatePath("/library");
    return { success: true };
  } catch {
    return { error: "Failed to delete document." };
  }
}
