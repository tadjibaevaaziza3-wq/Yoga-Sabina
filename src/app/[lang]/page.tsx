import { Hero } from "@/components/landing/Hero"
import { IntroSection } from "@/components/landing/IntroSection"
import { ProgramsSection } from "@/components/landing/ProgramsSection"
import { AboutSection } from "@/components/landing/AboutSection"
import { TrainerSection } from "@/components/landing/TrainerSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { InstagramSection } from "@/components/landing/InstagramSection"
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"

// Force Rebuild
export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang as Locale)

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          'FRONTEND_HERO_PHOTO', 'FRONTEND_TRAINER_PHOTO', 'FRONTEND_MAIN_VIDEO', 'FRONTEND_VIDEO_BANNER',
          'FRONTEND_PROGRAMS_ONLINE_BG', 'FRONTEND_PROGRAMS_OFFLINE_BG',
          'FRONTEND_INSTA_1', 'FRONTEND_INSTA_2', 'FRONTEND_INSTA_3', 'FRONTEND_INSTA_4'
        ]
      }
    }
  })

  const getSetting = (key: string, defaultValue: string) => {
    const setting = settings.find((s: any) => s.key === key)
    return setting?.value || defaultValue
  }

  const heroPhotoUrl = getSetting('FRONTEND_HERO_PHOTO', '/images/hero-sabina.png')
  const trainerPhotoUrl = getSetting('FRONTEND_TRAINER_PHOTO', '/images/trainer-sabina.png')
  const mainVideoUrl = getSetting('FRONTEND_MAIN_VIDEO', '/intro-video.mp4')
  const videoBannerUrl = getSetting('FRONTEND_VIDEO_BANNER', '/images/hero.png')
  const onlineBgUrl = getSetting('FRONTEND_PROGRAMS_ONLINE_BG', '/images/online-bg.jpg')
  const offlineBgUrl = getSetting('FRONTEND_PROGRAMS_OFFLINE_BG', '/images/offline-bg.jpg')

  const insta1Url = getSetting('FRONTEND_INSTA_1', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&h=600&auto=format&fit=crop')
  const insta2Url = getSetting('FRONTEND_INSTA_2', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&h=600&auto=format&fit=crop')
  const insta3Url = getSetting('FRONTEND_INSTA_3', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=600&h=600&auto=format&fit=crop')
  const insta4Url = getSetting('FRONTEND_INSTA_4', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=600&h=600&auto=format&fit=crop')

  return (
    <main className="min-h-screen">
      <Hero photoUrl={heroPhotoUrl} />
      <TrainerSection photoUrl={trainerPhotoUrl} />
      <AboutSection />
      <IntroSection videoUrl={mainVideoUrl} bannerUrl={videoBannerUrl} />
      <ProgramsSection onlineBgUrl={onlineBgUrl} offlineBgUrl={offlineBgUrl} />
      <InstagramSection post1Url={insta1Url} post2Url={insta2Url} post3Url={insta3Url} post4Url={insta4Url} />
      <FAQSection lang={lang} />
    </main>
  )
}
