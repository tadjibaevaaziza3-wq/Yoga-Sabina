import type { Metadata, ResolvingMetadata } from "next";
import "../globals.css";
import { Locale, getDictionary } from "@/dictionaries/get-dictionary";
import { AIAgentWrapper } from "@/components/AIAgentWrapper";
import { DictionaryProvider } from "@/components/providers/DictionaryProvider";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FooterWrapper } from "@/components/FooterWrapper";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Toaster } from "sonner";
import { TrackingProvider } from "@/components/providers/tracking-provider";
import { StructuredData } from "@/components/seo/StructuredData";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { lang } = await params;

  const uzTitle = "Baxtli Men | Sabina Polatova";
  const ruTitle = "Baxtli Men | Сабина Полатова";

  const uzDesc = "Yoga, meditatsiya va shaxsiy rivojlanish platformasi. Sabina Polatovadan individual maslahatlar va mualliflik kurslari. Erkaklar, ayollar va bolalar uchun.";
  const ruDesc = "Платформа йоги, медитации и личностного роста. Индивидуальные консультации и авторские курсы от Сабины Полатовой. Для мужчин, женщин и детей.";

  const title = lang === 'ru' ? ruTitle : uzTitle;
  const description = lang === 'ru' ? ruDesc : uzDesc;
  const siteUrl = "https://baxtli-men.uz";

  return {
    title: {
      default: title,
      template: `%s | Baxtli Men`
    },
    description: description,
    keywords: ["yoga", "meditatsiya", "salomatlik", "shaxsiy rivojlanish", "Sabina Polatova", "baxtli hayot", "men", "women", "kids"],
    authors: [{ name: "Sabina Polatova" }],
    creator: "Baxtli Men By Sabina Polatova",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'uz': '/uz',
        'ru': '/ru',
      },
    },
    openGraph: {
      type: "website",
      locale: lang === 'ru' ? "ru_RU" : "uz_UZ",
      url: `${siteUrl}/${lang}`,
      siteName: "Baxtli Men",
      title: title,
      description: description,
      images: [
        {
          url: "/images/hero-sabina.png",
          width: 1200,
          height: 630,
          alt: "Baxtli Men By Sabina Polatova",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["/images/hero-sabina.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (lang !== "ru" && lang !== "uz") {
    redirect("/ru");
  }

  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Baxtli Men Academy",
    "description": "Yoga and Wellness Academy for everyone by Sabina Polatova",
    "url": "https://baxtli-men.uz",
    "logo": "https://baxtli-men.uz/images/logo.png",
    "founder": {
      "@type": "Person",
      "name": "Sabina Polatova"
    },
    "sameAs": [
      "https://instagram.com/sabinapolatova",
      "https://t.me/baxtlimen",
      "https://www.youtube.com/@sabina_yogauz",
      "https://sabinapolatova.taplink.ws"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+998901234567",
      "contactType": "customer service"
    }
  };

  const consultationSetting = await prisma.systemSetting.findUnique({
    where: { key: 'IS_CONSULTATION_ENABLED' }
  });
  const isConsultationEnabled = consultationSetting?.value !== 'false';

  return (
    <html lang={locale} className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-primary selection:bg-accent selection:text-primary min-h-screen`} suppressHydrationWarning>
        <StructuredData data={orgSchema} id="org-schema" />
        <DictionaryProvider dictionary={dictionary} lang={locale}>
          <TrackingProvider>
            <HeaderWrapper isConsultationEnabled={isConsultationEnabled} />
            {children}
            <Toaster position="top-center" richColors />
            <FooterWrapper isConsultationEnabled={isConsultationEnabled} />
            <AIAgentWrapper lang={locale} />
          </TrackingProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
