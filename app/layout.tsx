import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "簿記2級 ネット試験 模擬試験",
  description: "簿記2級のネット試験形式の模擬試験アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
