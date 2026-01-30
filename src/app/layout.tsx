import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AppStateProvider } from "@/context/app-state-context";
import { LanguageProvider } from "@/context/language-context";
import { SessionProvider } from "@/context/session-context";
import { ProtectedLayout } from "@/components/protected-layout";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import "./globals.css";
import { Chatbot } from "@/components/chatbot";
import { Sidebar } from "@/components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Farmer Saathi - Smart Farming Platform</title>
        <meta name="description" content="Empowering farmers with AI-powered tools for crop management, market insights, and community support" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />

        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        ></script>

        {/* PWA manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a84ff" />
      </head>

      <body className={"font-body antialiased"} suppressHydrationWarning>
        <LanguageProvider>
          <AppStateProvider>
            <FirebaseClientProvider>
              <SessionProvider>
                <div>
                  {/* <Sidebar /> */}
                  <main>
                    <ProtectedLayout>{children}</ProtectedLayout>
                  </main>
                </div>

                <Chatbot />
              </SessionProvider>
            </FirebaseClientProvider>

            <Toaster />
          </AppStateProvider>
        </LanguageProvider>

        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
