import { Metadata } from "next";
import { getDocuments } from "@/features/library/actions/document-actions";
import { LibraryClient } from "@/features/library/components/library-client";
import { Library } from "lucide-react";

export const metadata: Metadata = {
  title: "Knowledge Library | AmarQuiz",
  description: "Upload and manage your learning documents.",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const docs = await getDocuments();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Knowledge Library
          </h1>
          <p className="mt-2 text-white/60">
            Upload documents and turn them into quizzes with AI.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <Library className="h-6 w-6 text-violet-400" />
        </div>
      </div>

      <hr className="border-white/10" />

      <LibraryClient initialDocuments={docs as any} />
    </div>
  );
}
