import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FronteggAppProvider } from "@frontegg/nextjs/app";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnboardingGuard from "@/components/OnboardingGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dignified BioPharma App - Clinical Research Portal",
  description: "A comprehensive demo showcasing Dignified BioPharma authentication, profile management, and admin capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authOptions = {
    keepSessionAlive: true, // Uncomment this in order to maintain the session alive
    // routes: { authenticatedUrl: '/profile' } 
  };

  const metadata = {
    navigation: {
      profile: {
        visibility: "hidden" as const
      },
      privacy: {
        visibility: 'always' as const
      },
      personalApiTokens: {
        visibility: "byPermissions" as const
      },
      account: {
        visibility: "byPermissions" as const
      },
      users: {
        visibility: "byPermissions" as const
      },
      groups: {
        visibility: "byPermissions" as const
      },
      roles: {
        visibility: "byPermissions" as const
      },
      security: {
        visibility: "byPermissions" as const
      },
      sso: {
        visibility: "byPermissions" as const
      },
      provisioning: {
        visibility: "byPermissions" as const
      },
      audits: {
        visibility: "byPermissions" as const
      },
      webhooks: {
        visibility: "byPermissions" as const
      },
      apiTokens: {
        visibility: "byPermissions" as const
      },
      subscriptionPlans: {
        visibility: "byPermissions" as const
      }
    }
  }
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <FronteggAppProvider authOptions={authOptions} metadata={metadata} customLoader={true}>
          <OnboardingGuard />
          <Header />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </FronteggAppProvider>
      </body>
    </html>
  );
}
