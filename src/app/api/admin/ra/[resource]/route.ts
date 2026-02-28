import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth/admin-auth";

// Helper to convert React-Admin query params to Prisma query
function parseQuery(url: URL) {
    const sort = url.searchParams.get('sort');
    const range = url.searchParams.get('range');
    const filter = url.searchParams.get('filter');

    let prismaSort: any = {};
    if (sort) {
        try {
            const [field, order] = JSON.parse(sort);
            if (field === 'id') {
                prismaSort = { createdAt: order.toLowerCase() }; // Default fallback for ID since it's a UUID
            } else {
                prismaSort = { [field]: order.toLowerCase() };
            }
        } catch (e) { }
    } else {
        prismaSort = { createdAt: 'desc' };
    }

    let prismaRange: any = {};
    if (range) {
        try {
            const [start, end] = JSON.parse(range);
            prismaRange = {
                skip: start,
                take: end - start + 1,
            };
        } catch (e) { }
    }

    let prismaWhere: any = {};
    let customFilters: Record<string, string> = {};
    // Custom filter keys that are computed post-query (not direct Prisma fields)
    // courseId is only custom for 'users' resource (post-processing); for modules/lessons it's a real Prisma field
    const ALWAYS_CUSTOM_KEYS = ['paymentStatus', 'expiryAlarm', 'subscriptionCount'];
    const USERS_ONLY_CUSTOM_KEYS = ['courseId'];

    // Determine which resource we're dealing with
    const urlPath = url.pathname;
    const resourceSegment = urlPath.split('/').pop() || '';
    const isUsersResource = resourceSegment === 'users';
    const CUSTOM_FILTER_KEYS = isUsersResource ? [...ALWAYS_CUSTOM_KEYS, ...USERS_ONLY_CUSTOM_KEYS] : ALWAYS_CUSTOM_KEYS;

    if (filter) {
        try {
            const parsedFilter = JSON.parse(filter);

            Object.keys(parsedFilter).forEach(key => {
                // Extract custom filters for post-processing
                if (CUSTOM_FILTER_KEYS.includes(key)) {
                    customFilters[key] = parsedFilter[key];
                    return;
                }
                if (key === 'q') {
                    const searchTerm = parsedFilter[key];
                    if (searchTerm && searchTerm.length > 0) {
                        prismaWhere.OR = [
                            { firstName: { contains: searchTerm, mode: 'insensitive' } },
                            { lastName: { contains: searchTerm, mode: 'insensitive' } },
                            { phone: { contains: searchTerm, mode: 'insensitive' } },
                            { telegramUsername: { contains: searchTerm, mode: 'insensitive' } },
                            { telegramId: { contains: searchTerm, mode: 'insensitive' } },
                            { email: { contains: searchTerm, mode: 'insensitive' } },
                        ];
                    }
                } else if (Array.isArray(parsedFilter[key])) {
                    prismaWhere[key] = { in: parsedFilter[key] };
                } else if (typeof parsedFilter[key] === 'string' && parsedFilter[key].length > 0) {
                    prismaWhere[key] = parsedFilter[key];
                } else {
                    prismaWhere[key] = parsedFilter[key];
                }
            });

        } catch (e) { }
    }

    return { prismaSort, prismaRange, prismaWhere, customFilters };
}

const resourceToModel: Record<string, keyof typeof prisma> = {
    users: 'user',
    courses: 'course',
    lessons: 'lesson',
    modules: 'module',
    appcontents: 'appContent',
    aitrainings: 'aiTraining',
    faqs: 'fAQ',
    chatmessages: 'chatMessage',
    coursechats: 'courseChat',
    announcements: 'announcement',
    consultations: 'course',
    purchases: 'purchase',
    subscriptions: 'subscription',
    assets: 'asset',
    comments: 'comment',
    triggers: 'trigger',
    automations: 'trigger',
    automationsteps: 'automationStep',
    userautomationqueue: 'userAutomationQueue',
    feedbacks: 'feedback',
};

// GET /api/admin/ra/[resource]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resource = (await params).resource;
    const url = new URL(request.url);
    const { prismaSort, prismaRange, prismaWhere, customFilters } = parseQuery(url);

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        // Resource-specific includes for richer list data
        const resourceIncludes: Record<string, any> = {
            users: {
                subscriptions: {
                    include: { course: { select: { id: true, title: true } } },
                    orderBy: { startsAt: 'desc' as const },
                },
                purchases: {
                    select: {
                        id: true,
                        status: true,
                        screenshotUrl: true,
                        verifiedByAdmin: true,
                        courseId: true,
                        course: { select: { id: true, title: true } },
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' as const },
                },
            },
        };

        const include = resourceIncludes[resource] || undefined;

        let data: any[];
        let total: number;

        try {
            [data, total] = await Promise.all([
                delegate.findMany({
                    where: prismaWhere,
                    orderBy: prismaSort,
                    ...prismaRange,
                    ...(include ? { include } : {}),
                }),
                delegate.count({ where: prismaWhere })
            ]);
        } catch (sortError: any) {
            // If sort field doesn't exist (e.g. FAQ has no createdAt), retry without sort
            [data, total] = await Promise.all([
                delegate.findMany({
                    where: prismaWhere,
                    ...prismaRange,
                    ...(include ? { include } : {}),
                }),
                delegate.count({ where: prismaWhere })
            ]);
        }

        // Post-process: compute derived subscription fields for users
        if (resource === 'users') {
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            data = data.map((user: any) => {
                const subs = user.subscriptions || [];
                const purchases = user.purchases || [];
                const activeSubs = subs.filter((s: any) => s.status === 'ACTIVE' && new Date(s.endsAt) > now);
                const firstSub = subs.length > 0
                    ? subs.reduce((earliest: any, s: any) => new Date(s.startsAt) < new Date(earliest.startsAt) ? s : earliest)
                    : null;

                const latestActiveSub = activeSubs.length > 0
                    ? activeSubs.reduce((latest: any, s: any) => new Date(s.endsAt) > new Date(latest.endsAt) ? s : latest)
                    : null;

                const isExpiringSoon = latestActiveSub
                    ? new Date(latestActiveSub.endsAt) <= threeDaysFromNow
                    : false;
                const isExpired = latestActiveSub ? new Date(latestActiveSub.endsAt) < now : false;

                const pendingPayments = purchases.filter(
                    (p: any) => p.screenshotUrl && !p.verifiedByAdmin && p.status === 'PENDING'
                );

                const summaryParts = subs.map((s: any) => {
                    const isActive = s.status === 'ACTIVE' && new Date(s.endsAt) > now;
                    const statusLabel = isActive ? 'Faol' : s.status === 'EXPIRED' ? 'Tugagan' : 'Bekor';
                    const title = s.course?.title;
                    const displayTitle = typeof title === 'object' ? ((title as any)?.uz || (title as any)?.ru || '—') : (title || '—');
                    return `${displayTitle} (${statusLabel})`;
                });

                return {
                    ...user,
                    subscriptions: undefined,
                    purchases: undefined,
                    totalSubscriptionCount: subs.length,
                    activeSubscriptionCount: activeSubs.length,
                    activeSubscriptionsSummary: summaryParts.join(', ') || '—',
                    firstSubscriptionDate: firstSub?.startsAt || null,
                    subStartDate: latestActiveSub?.startsAt || null,
                    subEndDate: latestActiveSub?.endsAt || null,
                    isExpiringSoon,
                    isExpired,
                    hasPendingPayment: pendingPayments.length > 0,
                    pendingPaymentCount: pendingPayments.length,
                    pendingPaymentCourse: pendingPayments[0]?.course?.title || null,
                    _courseIds: subs.map((s: any) => s.course?.id).filter(Boolean),
                };
            });

            // Apply custom filters (these depend on post-processed data)
            if (customFilters.paymentStatus) {
                if (customFilters.paymentStatus === 'paid') {
                    data = data.filter((u: any) => u.activeSubscriptionCount > 0);
                } else if (customFilters.paymentStatus === 'unpaid') {
                    data = data.filter((u: any) => u.activeSubscriptionCount === 0 && !u.hasPendingPayment);
                } else if (customFilters.paymentStatus === 'pending') {
                    data = data.filter((u: any) => u.hasPendingPayment);
                }
            }
            if (customFilters.courseId) {
                data = data.filter((u: any) => u._courseIds?.includes(customFilters.courseId));
            }
            if (customFilters.expiryAlarm) {
                if (customFilters.expiryAlarm === 'expiring_3d') {
                    data = data.filter((u: any) => u.isExpiringSoon && !u.isExpired);
                } else if (customFilters.expiryAlarm === 'expired') {
                    data = data.filter((u: any) => u.isExpired || (u.totalSubscriptionCount > 0 && u.activeSubscriptionCount === 0));
                } else if (customFilters.expiryAlarm === 'active') {
                    data = data.filter((u: any) => u.activeSubscriptionCount > 0 && !u.isExpiringSoon);
                }
            }
            if (customFilters.subscriptionCount) {
                const count = parseInt(customFilters.subscriptionCount, 10);
                if (count === 0) {
                    data = data.filter((u: any) => u.activeSubscriptionCount === 0);
                } else {
                    data = data.filter((u: any) => u.activeSubscriptionCount >= count);
                }
            }

            // Recalculate total after custom filtering
            total = data.length;
        }

        return new NextResponse(JSON.stringify(data), {
            headers: {
                'Content-Range': `${resource} ${prismaRange.skip || 0}-${(prismaRange.skip || 0) + data.length - 1}/${total}`,
                'Access-Control-Expose-Headers': 'Content-Range'
            }
        });

    } catch (error: any) {
        console.error(`Error querying ${resource}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/ra/[resource]
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resource = (await params).resource;
    const body = await request.json();

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        // Remove ID and date fields if present to let DB handle defaults
        const { id: _id, createdAt, updatedAt, ...createData } = body as any;

        // Sanitize createData: convert "" to null for optional fields 
        // but preserve required foreign keys
        const requiredFKs: Record<string, string[]> = {
            lesson: ['courseId'],
            automationStep: ['triggerId'],
            triggerLog: ['triggerId', 'userId'],
            userAutomationQueue: ['userId', 'triggerId', 'automationStepId'],
        };
        const requiredFields = requiredFKs[modelName as string] || [];

        for (const key in createData) {
            if (createData[key] === "") {
                if (requiredFields.includes(key)) {
                    return NextResponse.json(
                        { message: `"${key}" maydoni bo'sh bo'lishi mumkin emas` },
                        { status: 400 }
                    );
                }
                createData[key] = null;
            }
        }

        // Validate required FK fields are present
        for (const fk of requiredFields) {
            if (!createData[fk]) {
                return NextResponse.json(
                    { message: `"${fk}" maydoni majburiy. Iltimos, tanlang.` },
                    { status: 400 }
                );
            }
        }

        const data = await delegate.create({
            data: createData
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error creating ${resource}:`, error);

        // Handle Prisma unique constraint error gracefully for React Admin
        if (error.code === 'P2002') {
            const fields = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'bu qiymat';
            return NextResponse.json({ message: `Bu ma'lumot (${fields}) tizimda allaqachon mavjud.` }, { status: 400 });
        }

        return NextResponse.json({ message: error.message || 'Server xatosi', error: error.message }, { status: 500 });
    }
}
