import type { Metadata } from "next";
// Temporarily disabled Google Fonts due to network issues during build
// import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Locale } from "@/dictionaries/get-dictionary";
import { AIAgent } from "@/components/AIAgent";

// Using system fonts temporarily
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

const playfair = {
  variable: "--font-playfair",
  className: "font-serif",
};

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin", "cyrillic"],
//   fallback: ["system-ui", "arial"],
//   display: "swap",
// });

// const playfair = Playfair_Display({
//   variable: "--font-playfair",
//   subsets: ["latin", "cyrillic"],
//   fallback: ["Georgia", "serif"],
//   display: "swap",
// });

export const metadata: Metadata = {
  title: {
    default: "Baxtli Men | Sabina Polatova",
    template: "%s | Baxtli Men"
  },
  description: "Ayollar uchun yoga, meditatsiya va shaxsiy rivojlanish platformasi. Sabina Polatovadan individual maslahatlar va mualliflik kurslari.",
  keywords: ["yoga", "meditatsiya", "ayollar salomatligi", "shaxsiy rivojlanish", "Sabina Polatova", "baxtli hayot"],
  authors: [{ name: "Sabina Polatova" }],
  creator: "Baxtli Men Academy",
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://baxtli-men.uz",
    siteName: "Baxtli Men",
    title: "Baxtli Men | Sabina Polatova",
    description: "Ayollar uchun yoga va meditatsiya akademiyasi.",
    images: [
      {
        url: "/images/hero.png", // Using existing hero image for social preview
        width: 1200,
        height: 630,
        alt: "Baxtli Men Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baxtli Men | Sabina Polatova",
    description: "Ayollar uchun yoga va meditatsiya akademiyasi.",
    images: ["/images/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-primary selection:bg-accent selection:text-primary`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Baxtli Men Academy",
              "description": "Yoga and Wellness Academy for women by Sabina Polatova",
              "url": "https://baxtli-men.uz",
              "logo": "https://baxtli-men.uz/images/hero.png",
              "founder": {
                "@type": "Person",
                "name": "Sabina Polatova"
              },
              "sameAs": [
                "https://instagram.com/sabinapolatova",
                "https://t.me/baxtlimen"
              ]
            })
          }}
        />
        {children}
        <AIAgent lang={lang} />
      </body>
    </html>
  );
}
