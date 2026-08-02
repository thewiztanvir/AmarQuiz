"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes, apiKeys, documents } from "@/db/schema";
import { decryptKey } from "@/lib/encryption";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});

export type Question = z.infer<typeof questionSchema>;

const generateSchema = z.object({
  documentId: z.string().optional(),
  customTopic: z.string().optional(),
  questionCount: z.number().int().min(3).max(30),
  difficulty: z.enum(["easy", "medium", "hard"]),
  provider: z.enum(["gemini", "openai", "claude"]),
});

export type GenerateQuizInput = z.infer<typeof generateSchema>;

export async function generateQuiz(input: GenerateQuizInput) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });
    if (!session?.user) return { error: "Unauthorized" };

    const parsed = generateSchema.safeParse(input);
    if (!parsed.success) return { error: "Invalid input." };

    const { documentId, customTopic, questionCount, difficulty, provider } = parsed.data;

    // 1. Get the user's API key for the chosen provider
    const keyRecord = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.userId, session.user.id), eq(apiKeys.provider, provider)),
    });
    if (!keyRecord) return { error: `No ${provider} API key configured. Please add it in Settings.` };

    const apiKey = decryptKey(keyRecord.encryptedKey);

    // 2. Get context (from document or custom topic)
    let context = "";
    let title = "";
    let topic = customTopic || "";

    if (documentId) {
      const doc = await db.query.documents.findFirst({
        where: and(eq(documents.id, documentId), eq(documents.userId, session.user.id)),
      });
      if (!doc) return { error: "Document not found." };
      if (doc.status !== "ready") return { error: "Document is still being processed. Please wait." };
      context = doc.extractedText?.slice(0, 12000) || "";
      title = `Quiz on "${doc.name}"`;
      topic = doc.name;
    } else if (customTopic) {
      title = `Quiz on "${customTopic}"`;
    } else {
      return { error: "Provide a document or a topic." };
    }

    const prompt = buildPrompt({ context, topic, questionCount, difficulty });

    // 3. Call the correct AI provider
    let rawJson = "";

    if (provider === "gemini") {
      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      const { generateText } = await import("ai");
      const google = createGoogleGenerativeAI({ apiKey });
      const { text } = await generateText({
        model: google("gemini-2.0-flash"),
        prompt,
      });
      rawJson = text;
    } else if (provider === "openai") {
      const { createOpenAI } = await import("@ai-sdk/openai");
      const { generateText } = await import("ai");
      const openai = createOpenAI({ apiKey });
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
      });
      rawJson = text;
    } else if (provider === "claude") {
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const { generateText } = await import("ai");
      const anthropic = createAnthropic({ apiKey });
      const { text } = await generateText({
        model: anthropic("claude-3-5-haiku-20241022"),
        prompt,
      });
      rawJson = text;
    }

    // 4. Parse the JSON out of the response
    const jsonMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawJson];
    const questions = z.array(questionSchema).parse(JSON.parse(jsonMatch[1].trim()));

    // 5. Persist the quiz
    const [quiz] = await db.insert(quizzes).values({
      userId: session.user.id,
      documentId: documentId || null,
      title,
      topic,
      difficulty,
      questionCount: questions.length,
      questions,
      status: "ready",
    }).returning();

    revalidatePath("/quizzes");
    return { success: true, quizId: quiz.id };
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return { error: error?.message || "Failed to generate quiz. Check your API key and try again." };
  }
}

function buildPrompt({ context, topic, questionCount, difficulty }: {
  context: string;
  topic: string;
  questionCount: number;
  difficulty: string;
}) {
  const contextBlock = context
    ? `Use ONLY the following document content as the source of truth:\n\n<document>\n${context}\n</document>`
    : `Generate questions about the topic: "${topic}". Use your general knowledge.`;

  return `You are an expert quiz creator. Generate exactly ${questionCount} multiple-choice questions.
Difficulty: ${difficulty.toUpperCase()}

${contextBlock}

Return ONLY a valid JSON array, no extra text, no markdown explanation outside the code block. Format:

\`\`\`json
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]
\`\`\`

Rules:
- Each question must have exactly 4 options.
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D).
- Questions must be clear and unambiguous.
- Difficulty "${difficulty}": ${difficulty === "easy" ? "straightforward recall questions" : difficulty === "medium" ? "some inference required" : "deep understanding and application required"}.`;
}

export async function getQuizzes() {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });
    if (!session?.user) return [];

    return await db.query.quizzes.findMany({
      where: eq(quizzes.userId, session.user.id),
      columns: { questions: false },
      orderBy: (q, { desc }) => [desc(q.createdAt)],
    });
  } catch {
    return [];
  }
}

export async function getQuiz(quizId: string) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });
    if (!session?.user) return null;

    return await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, quizId), eq(quizzes.userId, session.user.id)),
    });
  } catch {
    return null;
  }
}

export async function deleteQuiz(quizId: string) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: { headers: await headers() },
    });
    if (!session?.user) return { error: "Unauthorized" };

    await db.delete(quizzes).where(
      and(eq(quizzes.id, quizId), eq(quizzes.userId, session.user.id))
    );

    revalidatePath("/quizzes");
    return { success: true };
  } catch {
    return { error: "Failed to delete quiz." };
  }
}
