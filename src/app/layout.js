import { Inter } from "next/font/google";
import "./globals.css";
import { ProductMutationProvider } from "@/context/ProductMutationContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Nexgensis Product Dashboard",
  description: "Browse, search, and manage your product catalogue",
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/logo.png"],
    apple: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A]">
        <ProductMutationProvider>{children}</ProductMutationProvider>
      </body>
    </html>
  );
}

