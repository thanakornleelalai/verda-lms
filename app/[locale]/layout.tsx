import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { routing } from "@/i18n/routing";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { VerdyChat } from "@/components/chatbot/VerdyChat";
import { WishlistProvider } from "@/lib/wishlist";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "th" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>
          <WishlistProvider>
            {children}
            <PWAInstallBanner />
            <VerdyChat />
          </WishlistProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
