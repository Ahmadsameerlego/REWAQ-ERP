import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "رِواق ERP | المنظومة المتكاملة لإدارة معارض الأثاث والديكور",
  description: "Rewaq ERP - المنظومة السحابية الذكية لإدارة معارض وصالات الأثاث، الديكور والإضاءة مع المتاجر الإلكترونية وربط إعلانات Meta",
  icons: {
    icon: "/images/rewaq-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased font-sans bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
