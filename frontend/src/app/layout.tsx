import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "世界杯赛事信息与互动预测平台",
  description:
    "面向世界杯足球赛事的信息服务与互动预测平台，提供赛事浏览、比分预测和赛后讨论功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
