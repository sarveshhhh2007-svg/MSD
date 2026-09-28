import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NExtclass — AI-Powered Attendance Intelligence",
  description: "NExtclass: Premium SaaS Attendance Intelligence, Prediction, Recovery Planning & Campus Room Discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} font-sans antialiased bg-[#F7F4E8] text-[#171717] min-h-screen selection:bg-[#FFD81A]/40 selection:text-[#171717]`}
      >
        {children}
      </body>
    </html>
  );
}
