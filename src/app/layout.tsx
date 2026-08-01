import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | AmarQuiz",
    default: "AmarQuiz - AI-powered learning platform",
  },
  description: "Generate quizzes, track progress, and master any topic with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#0a0a0f] text-white">
        {children}
      </body>
    </html>
  );
}
