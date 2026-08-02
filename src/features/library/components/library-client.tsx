"use client";

import { useState, useRef } from "react";
import { uploadDocument, deleteDocument } from "../actions/document-actions";
import { Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";
import Link from "next/link";

type Document = {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  status: "processing" | "ready" | "error";
  createdAt: Date;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function StatusBadge({ status }: { status: Document["status"] }) {
  if (status === "ready") return (
    <span className="flex items-center gap-1 text-xs text-emerald-400">
      <CheckCircle className="h-3 w-3" /> Ready
    </span>
  );
  if (status === "processing") return (
    <span className="flex items-center gap-1 text-xs text-amber-400">
      <Clock className="h-3 w-3 animate-pulse" /> Processing
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="h-3 w-3" /> Error
    </span>
  );
}

function typeIcon(type: string) {
  const colors: Record<string, string> = {
    pdf: "text-red-400", docx: "text-blue-400", txt: "text-white/60", md: "text-purple-400",
  };
  return <FileText className={`h-5 w-5 ${colors[type] || "text-white/60"}`} />;
}

export function LibraryClient({ initialDocuments }: { initialDocuments: Document[] }) {
  const [docs, setDocs] = useState(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDocument(fd);
      if (result.error) {
        setError(result.error);
      } else {
        // Optimistic insert
        setDocs((prev) => [
          {
            id: result.documentId!,
            name: file.name,
            fileType: file.name.endsWith(".md") ? "md" : file.type.includes("pdf") ? "pdf" : file.type.includes("wordprocessingml") ? "docx" : "txt",
            fileSize: file.size,
            status: "processing" as const,
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document? Any quizzes linked to it will remain.")) return;
    setDeleting(id);
    const result = await deleteDocument(id);
    if (result.success) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } else {
      setError(result.error || "Failed to delete");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all ${
          dragOver
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/[0.07]"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${dragOver ? "bg-violet-500/20" : "bg-white/10 group-hover:bg-violet-500/10"}`}>
          {uploading
            ? <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            : <Upload className={`h-8 w-8 transition-colors ${dragOver ? "text-violet-400" : "text-white/40 group-hover:text-violet-400"}`} />
          }
        </div>
        <div className="text-center">
          <p className="font-semibold text-white">
            {uploading ? "Uploading..." : "Drop files here or click to browse"}
          </p>
          <p className="mt-1 text-sm text-white/40">
            PDF, DOCX, TXT, Markdown — up to 10 MB each
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Documents list */}
      {docs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 text-center">
          <FileText className="h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">Your library is empty. Upload a document to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-all hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                {typeIcon(doc.fileType)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{doc.name}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-white/40">{formatBytes(doc.fileSize)}</span>
                  <span className="text-white/20">·</span>
                  <StatusBadge status={doc.status} />
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {doc.status === "ready" && (
                  <Link
                    href={`/quizzes/generate?docId=${doc.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-600/20 px-3 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-600/30"
                  >
                    <Zap className="h-3 w-3" />
                    Generate Quiz
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
                >
                  {deleting === doc.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
