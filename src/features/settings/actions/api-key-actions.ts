"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/db/schema";
import { encryptKey } from "@/lib/encryption";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

type Provider = "gemini" | "openai" | "claude";

export async function saveApiKey(provider: Provider, key: string) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });
    
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (!key || key.trim() === "") {
      return { error: "API Key cannot be empty" };
    }

    const encrypted = encryptKey(key);

    // Check if key already exists
    const existing = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.userId, session.user.id), eq(apiKeys.provider, provider)),
    });

    if (existing) {
      await db
        .update(apiKeys)
        .set({ encryptedKey: encrypted })
        .where(eq(apiKeys.id, existing.id));
    } else {
      await db.insert(apiKeys).values({
        userId: session.user.id,
        provider,
        encryptedKey: encrypted,
      });
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error saving API key:", error);
    return { error: "Failed to save API key" };
  }
}

export async function getConfiguredProviders() {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    if (!session?.user) {
      return [];
    }

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, session.user.id),
      columns: {
        provider: true,
      },
    });

    return keys.map((k) => k.provider);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return [];
  }
}

export async function deleteApiKey(provider: Provider) {
  try {
    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.userId, session.user.id), eq(apiKeys.provider, provider)));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting API key:", error);
    return { error: "Failed to delete API key" };
  }
}
