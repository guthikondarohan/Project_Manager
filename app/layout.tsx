import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ProjectFlow | Manage Tasks & Teams",
  description: "A dynamic project and task management dashboard with AI-powered task breakdown, real-time collaboration, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(30, 33, 48, 0.95)',
              color: '#f8f9fc',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ff4757', secondary: '#fff' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
