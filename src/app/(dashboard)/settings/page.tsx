import { Metadata } from "next";
import { ApiKeysForm } from "@/features/settings/components/api-keys-form";

export const metadata: Metadata = {
  title: "Settings | AmarQuiz",
  description: "Manage your account and AI configuration.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-white/60 mt-2">
          Manage your account preferences and API integrations.
        </p>
      </div>

      <hr className="border-white/10" />

      <ApiKeysForm />
    </div>
  );
}
