/**
 * User Agreement Text
 * Version 1.0
 */

export const USER_AGREEMENT_VERSION = '1.0';

export const USER_AGREEMENT_TEXT_UZ = `
BIR MARTALIK TOʻLOV ASOSIDA VIDEOKURSLARNI XARID QILISH BOʻYICHA OMMAVIY OFERTA

1. UMUMIY QOIDALAR
1.1. Ushbu oferta Xaridorlarni (jismoniy shaxslarni) roʻyxatdan oʻtkazish, identifikatsiya qilish va tasdiqlash tartibini, «Baxtli Men» platformasida elektron Shartnomalar tuzish tartibini belgilaydi, shuningdek, Xaridor va Platforma oʻrtasidagi shu orqali yuzaga keladigan munosabatlarni tartibga soladi.

Mazkur oferta, shuningdek, kurslarning oldi-sotdi munosabatlarini, ya'ni xaridor tomonidan videokursni xarid qilish va platforma tomonidan uni taqdim etish jarayonlarini ham tartibga soladi.

1.2. O'zbekiston Respublikasida elektron tijorat, iste'molchilarning huquqlarini himoya qilish va shaxsga doir ma'lumotlardan foydalanish kabi sohalardagi munosabatlar O'zbekiston Respublikasi Fuqarolik kodeksi, "Elektron tijorat to'g'risida"gi Qonun, Vazirlar Mahkamasining 2016-yil 2-iyundagi 185-son qarori bilan tasdiqlangan "Elektron tijoratni amalga oshirish qoidalari", "Iste'molchilar huquqlarini himoya qilish to'g'risida"gi Qonun, "Shaxsga doir ma'lumotlar to'g'risida"gi Qonun va boshqa normativ-huquqiy hujjatlar bilan tartibga solinadi.

[... полный текст соглашения ...]

12. YAKUNIY QOIDALAR
12.1. Ushbu oferta shartnomasi eʼlon qilingan sanadan boshlab, ikkinchi taraf uchun aktsept qilgan paytdan boshlab kuchga kiradi va Tomonlar oʻz majburiyatlarini toʻliq bajargunlariga qadar amal qiladi.
12.2. Ushbu shartnomaga qilinadigan barcha ilovalar, qoʻshimchalar va oʻzgarishlar ushbu shartnomaning ajralmas qismi hisoblanadi.
`;

// Full agreement text will be stored in database or CMS
// For now, using a shortened version for development
export function getUserAgreementText(lang: 'uz' | 'ru' = 'uz'): string {
    if (lang === 'ru') {
        return USER_AGREEMENT_TEXT_UZ; // TODO: Add Russian translation
    }
    return USER_AGREEMENT_TEXT_UZ;
}

export const USER_AGREEMENT_KEY_POINTS = [
    'Запрещено скачивать, записывать экран, транслировать, распространять, перепродавать видео',
    'Нарушение = юридические последствия + бан аккаунта',
    'Все видео защищены авторским правом и техническими средствами',
    'Водяные знаки на всех видео для идентификации пользователя',
    'Доступ к видео только через защищённые временные ссылки',
];
