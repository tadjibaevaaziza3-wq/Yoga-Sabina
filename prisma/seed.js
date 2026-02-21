const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();

    console.log('Seeding database...');

    // 1. Create All Courses (Online, Offline, consultations)
    const courses = [
        {
            id: "men-yoga-standard",
            title: "Онлайн: Тана йогатерапияси — Стандарт (для мужчин)",
            titleRu: "Йогатерапия для тела — Стандарт (для мужчин)",
            description: "Эркакларга тана-йогатерапияси туғрисида маълумот.",
            descriptionRu: "Информация о йогатерапии тела для мужчин.",
            price: 300000,
            durationDays: 30,
            durationLabel: "1 oy",
            type: "ONLINE",
            isActive: true,
            coverImage: "/images/courses/men-yoga.jpg",
            features: [
                "5 та йога машқлар",
                "1та дарс bir nechta nafas olish usullari bilan",
                "endokrin tizim sog'lomlashadi",
                "qon aylanish tizimi yahshilanadi",
                "libido ko'tariladi",
                "erkaklar kasalliklariga da'vo"
            ],
            featuresRu: [
                "5 йога-упражнений",
                "1 урок с техниками дыхания",
                "Оздоровление эндокринной системы",
                "Улучшение кровообращения",
                "Повышение либидо",
                "Лечение мужских заболеваний"
            ]
        },
        {
            id: "happy-women-club-standard",
            title: "Онлайн: Бахтли аёллар клуби ✨ Стандарт пакет ✨ (для женщин)",
            titleRu: "Онлайн: Клуб Счастливых Женщин ✨ Стандарт ✨ (для женщин)",
            description: "Инстаграмда, ёпиқ каналдаги дарсликлар.",
            descriptionRu: "Уроки в закрытом канале Инстаграм.",
            price: 100000,
            durationDays: 30,
            durationLabel: "1 oy",
            type: "ONLINE",
            isActive: true,
            coverImage: "/images/courses/woman-standard.jpg",
            features: ["gormonal yoga", "ayollik energiyasi", "hayz kuni yogasi", "limfodrenaj", "psixologik praktikalar"],
            featuresRu: ["Гормональная йога", "Женская энергия", "Йога в критические дни", "Лимфодренаж", "Психологические практики"]
        },
        {
            id: "happy-women-club-premium",
            title: "Онлайн: Бахтли аёллар клуби 🔥Премиум пакет🔥 (для женщин)",
            titleRu: "Онлайн: Клуб Счастливых Женщин 🔥Премиум🔥 (для женщин)",
            description: "Йога-клубимга аъзо бўлиш афзалликлари.",
            descriptionRu: "Преимущества членства в йога-клубе.",
            price: 200000,
            durationDays: 30,
            durationLabel: "1 oy",
            type: "ONLINE",
            isActive: true,
            coverImage: "/images/courses/woman-premium.jpg",
            features: ["har kun yoga darsi", "yangi darslar", "24/7 CHATda birgaman", "to'g'ri ovqatlanish bo'yicha maslahatlar", "BONUS: 1380ta oldingi darslar"],
            featuresRu: ["Ежедневные уроки", "Новые уроки", "Чат 24/7", "Советы по питанию", "БОНУС: 1380 уроков"]
        },
        {
            id: "face-yoga",
            title: "ТАБИЙ ЕШАРИШ (ЮЗ ЙОГАСИ) онлайн: - 3в1 (для женщин)",
            titleRu: "ЕСТЕСТВЕННОЕ ОМОЛОЖЕНИЕ (ЙОГА ДЛЯ ЛИЦА) онлайн: - 3в1 (для женщин)",
            description: "💎 ТАБИИЙ ЁШАРИШ (юз йогаси) курсим 3в1‼️",
            descriptionRu: "💎 Мой курс ЕСТЕСТВЕННОЕ ОМОЛОЖЕНИЕ (йога для лица) 3в1‼️",
            price: 300000,
            durationDays: 365,
            durationLabel: "Doimiy",
            type: "ONLINE",
            isActive: true,
            coverImage: "/images/courses/face-yoga.jpg"
        },
        {
            id: "psy-consult-online",
            title: "Психологческая Консультация (женская): 1 онлайн сессия",
            titleRu: "Психологическая консультация (женская): 1 онлайн сессия",
            description: "Психологик сессия тўғрисида маълумот.",
            descriptionRu: "Информация о психологической сессии.",
            price: 1000000,
            type: "ONLINE",
            productType: "CONSULTATION",
            consultationFormat: "ONLINE",
            isActive: true,
            coverImage: "/images/courses/psy-online.jpg"
        },
        {
            id: "psy-consult-offline",
            title: "Психологческая Консультация (женская): 1 живая офлайн сессия",
            titleRu: "Психологическая консультация (женская): 1 живая офлайн сессия",
            description: "Психологик сессия тўғрисида маълумот.",
            descriptionRu: "Информация о психологической сессии.",
            price: 2000000,
            type: "OFFLINE",
            productType: "CONSULTATION",
            consultationFormat: "OFFLINE",
            isActive: true,
            coverImage: "/images/courses/psy-offline.jpg"
        },
        {
            id: "offline-sophie-fit",
            title: "offline: 💚 Sophie Fit Zone 💚: 12 уроков (для женщин)",
            titleRu: "оффлайн: 💚 Sophie Fit Zone 💚: 12 уроков (для женщин)",
            description: "💚 Sophie Fit Zone 💚 Фитнес машғулотлари.",
            descriptionRu: "💚 Sophie Fit Zone 💚 Фитнес занятия.",
            price: 800000,
            durationDays: 30,
            durationLabel: "12 dars",
            type: "OFFLINE",
            isActive: true,
            coverImage: "/images/courses/sophie-fit.jpg",
            location: "CHORSU, Beruniy 12V, 3-qavat",
            schedule: "Seshanba, Payshanba, Shanba",
            times: "10:00 - 11:00 / 11:15 - 12:15"
        },
        {
            id: "offline-fit-dance",
            title: "💜 Fit-Dance 💜: 12 уроков (для женщин)",
            titleRu: "💜 Fit-Dance 💜: 12 уроков (для женщин)",
            description: "💜 Fit-Dance 💜 Ракс ва фитнес.",
            descriptionRu: "💜 Fit-Dance 💜 Танцы и фитнес.",
            price: 1500000,
            durationDays: 30,
            durationLabel: "12 dars",
            type: "OFFLINE",
            isActive: true,
            coverImage: "/images/courses/fit-dance.jpg",
            location: "Akkorgan 18A (Darxon)",
            schedule: "Seshanba, Payshanba, Shanba",
            times: "13:00 - 14:00"
        },
        {
            id: "offline-do-yoga",
            title: "💛 DoYogaStudios 💛: 8 уроков (для женщин)",
            titleRu: "💛 DoYogaStudios 💛: 8 уроков (для женщин)",
            description: "💛 DoYogaStudios 💛 Профессионал йога.",
            descriptionRu: "💛 DoYogaStudios 💛 Профессиональная йога.",
            price: 1600000,
            durationDays: 30,
            durationLabel: "8 dars",
            type: "OFFLINE",
            isActive: true,
            coverImage: "/images/courses/woman-premium.jpg",
            location: "Maxtumkuli ko'chasi, 45",
            schedule: "Dushanba, Chorshanba, Juma",
            times: "10:00 - 11:00 / 11:30 - 12:30"
        }
    ];

    for (const course of courses) {
        await prisma.course.upsert({
            where: { id: course.id },
            update: course,
            create: course
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$disconnect();
    });
