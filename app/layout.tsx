import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SnackbarProvider } from "./services/snackbarContext";
import { CountryFlagPolyfill } from "./emojis";
import { AuthProvider } from "@/app/components/contexts/authContext";  // ✅ ADD THIS
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkSphere",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <CountryFlagPolyfill />

        <AuthProvider>           {/* ✅ WRAP YOUR WHOLE APP HERE */}
          <SnackbarProvider>
            {children}
          </SnackbarProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
