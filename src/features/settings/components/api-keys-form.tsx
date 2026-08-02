"use client";

import { useState, useEffect } from "react";
import { saveApiKey, getConfiguredProviders, deleteApiKey } from "../actions/api-key-actions";
import { Loader2, Key, Check, Trash2 } from "lucide-react";

type Provider = "gemini" | "openai" | "claude";

export function ApiKeysForm() {
  const [configured, setConfigured] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Provider | null>(null);
  const [keys, setKeys] = useState<Record<Provider, string>>({
    gemini: "",
    openai: "",
    claude: "",
  });

  useEffect(() => {
    async function load() {
      const providers = await getConfiguredProviders();
      setConfigured(providers);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (provider: Provider) => {
    const key = keys[provider];
    if (!key) return;

    setSaving(provider);
    const result = await saveApiKey(provider, key);
    
    if (result.success) {
      if (!configured.includes(provider)) {
        setConfigured((prev) => [...prev, provider]);
      }
      setKeys((prev) => ({ ...prev, [provider]: "" }));
    } else {
      alert(result.error || "Failed to save key");
    }
    setSaving(null);
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(`Are you sure you want to delete your ${provider} key?`)) return;
    
    setSaving(provider);
    const result = await deleteApiKey(provider);
    
    if (result.success) {
      setConfigured((prev) => prev.filter((p) => p !== provider));
    } else {
      alert(result.error || "Failed to delete key");
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const providers: { id: Provider; name: string; icon: React.ReactNode }[] = [
    { id: "gemini", name: "Google Gemini", icon: <Key className="h-5 w-5" /> },
    { id: "openai", name: "OpenAI", icon: <Key className="h-5 w-5" /> },
    { id: "claude", name: "Anthropic Claude", icon: <Key className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-white">AI Provider Keys</h2>
        <p className="text-sm text-white/60 mt-1">
          Securely connect your AI providers. Keys are AES-256 encrypted before they are stored and are never exposed to the client.
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((p) => {
          const isConfigured = configured.includes(p.id);
          const isSaving = saving === p.id;

          return (
            <div
              key={p.id}
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isConfigured ? "bg-green-500" : "bg-white/20"
                        }`}
                      />
                      <span className="text-xs text-white/60">
                        {isConfigured ? "Configured" : "Not configured"}
                      </span>
                    </div>
                  </div>
                </div>

                {isConfigured && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={isSaving}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete Key"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="password"
                  placeholder={isConfigured ? "Enter new key to replace existing..." : "sk-..."}
                  value={keys[p.id]}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  onClick={() => handleSave(p.id)}
                  disabled={!keys[p.id] || isSaving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isConfigured ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
