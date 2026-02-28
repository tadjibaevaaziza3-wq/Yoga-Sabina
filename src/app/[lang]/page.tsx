import AnnouncementBanner from "@/components/shared/AnnouncementBanner"

import { Hero } from "@/components/landing/Hero"
import { IntroSection } from "@/components/landing/IntroSection"
import { ProgramsSection } from "@/components/landing/ProgramsSection"
import { AboutSection } from "@/components/landing/AboutSection"
import { TrainerSection } from "@/components/landing/TrainerSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { InstagramSection } from "@/components/landing/InstagramSection"
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from 'next/cache'

// Revalidate every 60 seconds instead of force-dynamic (which disabled ALL caching)
export const revalidate = 60;
export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang as Locale)

  // Cache settings for 60s — avoids DB query on every visitor
  const getCachedSettings = unstable_cache(
    async () => {
      try {
        return await prisma.systemSetting.findMany({
          where: {
            key: {
              in: [
                'IS_CONSULTATION_ENABLED',
                'FRONTEND_HERO_PHOTO', 'FRONTEND_TRAINER_PHOTO', 'FRONTEND_MAIN_VIDEO', 'FRONTEND_VIDEO_BANNER',
                'FRONTEND_PROGRAMS_ONLINE_BG', 'FRONTEND_PROGRAMS_OFFLINE_BG', 'FRONTEND_PROGRAMS_CONSULTATION_BG',
                'FRONTEND_INSTA_1', 'FRONTEND_INSTA_2', 'FRONTEND_INSTA_3', 'FRONTEND_INSTA_4',
                'APP_HERO_TITLE_UZ', 'APP_HERO_TITLE_RU',
                'APP_HERO_SUBTITLE_UZ', 'APP_HERO_SUBTITLE_RU',
                'APP_TRAINER_NAME',
                'APP_TRAINER_BIO_UZ', 'APP_TRAINER_BIO_RU',
                'APP_CTA_TEXT_UZ', 'APP_CTA_TEXT_RU',
                'APP_ABOUT_TEXT_UZ', 'APP_ABOUT_TEXT_RU',
                'APP_HERO_BADGE_UZ', 'APP_HERO_BADGE_RU',
                'APP_MISSION_TEXT_UZ', 'APP_MISSION_TEXT_RU',
                'APP_INTRO_TITLE_UZ', 'APP_INTRO_TITLE_RU',
                'APP_INTRO_SUBTITLE_UZ', 'APP_INTRO_SUBTITLE_RU',
                'APP_PROGRAMS_TITLE_UZ', 'APP_PROGRAMS_TITLE_RU',
                'APP_FAQ_TITLE_UZ', 'APP_FAQ_TITLE_RU',
                'APP_MEMBERS_COUNT'
              ]
            }
          }
        });
      } catch {
        return [];
      }
    },
    ['landing-settings'],
    { revalidate: 60 }
  );
  const settings = await getCachedSettings();

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
  const consultationBgUrl = getSetting('FRONTEND_PROGRAMS_CONSULTATION_BG', '/images/consultation-bg.jpg')
  const isConsultationEnabled = getSetting('IS_CONSULTATION_ENABLED', 'true') === 'true'

  const insta1Url = getSetting('FRONTEND_INSTA_1', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&h=600&auto=format&fit=crop')
  const insta2Url = getSetting('FRONTEND_INSTA_2', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&h=600&auto=format&fit=crop')
  const insta3Url = getSetting('FRONTEND_INSTA_3', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=600&h=600&auto=format&fit=crop')
  const insta4Url = getSetting('FRONTEND_INSTA_4', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=600&h=600&auto=format&fit=crop')

  // Text content overrides from admin settings
  const isUz = lang === 'uz'
  const heroTitle = getSetting(isUz ? 'APP_HERO_TITLE_UZ' : 'APP_HERO_TITLE_RU', '')
  const heroSubtitle = getSetting(isUz ? 'APP_HERO_SUBTITLE_UZ' : 'APP_HERO_SUBTITLE_RU', '')
  const trainerName = getSetting('APP_TRAINER_NAME', '')
  const trainerBio = getSetting(isUz ? 'APP_TRAINER_BIO_UZ' : 'APP_TRAINER_BIO_RU', '')
  const ctaText = getSetting(isUz ? 'APP_CTA_TEXT_UZ' : 'APP_CTA_TEXT_RU', '')
  const aboutText = getSetting(isUz ? 'APP_ABOUT_TEXT_UZ' : 'APP_ABOUT_TEXT_RU', '')
  const heroBadge = getSetting(isUz ? 'APP_HERO_BADGE_UZ' : 'APP_HERO_BADGE_RU', '')
  const missionText = getSetting(isUz ? 'APP_MISSION_TEXT_UZ' : 'APP_MISSION_TEXT_RU', '')
  const introTitle = getSetting(isUz ? 'APP_INTRO_TITLE_UZ' : 'APP_INTRO_TITLE_RU', '')
  const introSubtitle = getSetting(isUz ? 'APP_INTRO_SUBTITLE_UZ' : 'APP_INTRO_SUBTITLE_RU', '')
  const membersCount = getSetting('APP_MEMBERS_COUNT', '')

  return (
    <main className="min-h-screen">
      <Hero photoUrl={heroPhotoUrl} heroTitle={heroTitle} heroSubtitle={heroSubtitle} trainerName={trainerName} ctaText={ctaText} heroBadge={heroBadge} membersCount={membersCount} />
      <div className="max-w-4xl mx-auto px-6 py-4">
        <AnnouncementBanner lang={lang} variant="full" maxItems={3} />
      </div>
      <TrainerSection photoUrl={trainerPhotoUrl} trainerName={trainerName} trainerBio={trainerBio} />
      <AboutSection aboutText={aboutText} heroTitle={heroTitle} missionText={missionText} />
      <IntroSection videoUrl={mainVideoUrl} bannerUrl={videoBannerUrl} introTitle={introTitle} introSubtitle={introSubtitle} />
      <ProgramsSection
        onlineBgUrl={onlineBgUrl}
        offlineBgUrl={offlineBgUrl}
        consultationBgUrl={consultationBgUrl}
        isConsultationEnabled={isConsultationEnabled}
      />
      <InstagramSection post1Url={insta1Url} post2Url={insta2Url} post3Url={insta3Url} post4Url={insta4Url} />
      <FAQSection lang={lang} />
    </main>
  )
}
