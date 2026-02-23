import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromSession } from "@/lib/auth/admin-auth";

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
    if (filter) {
        try {
            const parsedFilter = JSON.parse(filter);

            // Handle React-Admin Reference Inputs (e.g. courseId: [1, 2, 3])
            // or q for full-text search
            Object.keys(parsedFilter).forEach(key => {
                if (key === 'q') {
                    // Requires manual mapping per resource or generic search over common fields
                    // For now handled manually per resource if needed
                } else if (Array.isArray(parsedFilter[key])) {
                    prismaWhere[key] = { in: parsedFilter[key] };
                } else if (typeof parsedFilter[key] === 'string' && parsedFilter[key].length > 0) {
                    // Check if it's an exact match vs contains
                    // In generic implementation we will do exact matches for IDs/Enums 
                    prismaWhere[key] = parsedFilter[key];
                } else {
                    prismaWhere[key] = parsedFilter[key];
                }
            });

        } catch (e) { }
    }

    return { prismaSort, prismaRange, prismaWhere };
}

const resourceToModel: Record<string, keyof typeof prisma> = {
    users: 'user',
    courses: 'course',
    lessons: 'lesson',
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
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resource = (await params).resource;
    const url = new URL(request.url);
    const { prismaSort, prismaRange, prismaWhere } = parseQuery(url);

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        let data: any[];
        let total: number;

        try {
            [data, total] = await Promise.all([
                delegate.findMany({
                    where: prismaWhere,
                    orderBy: prismaSort,
                    ...prismaRange,
                }),
                delegate.count({ where: prismaWhere })
            ]);
        } catch (sortError: any) {
            // If sort field doesn't exist (e.g. FAQ has no createdAt), retry without sort
            [data, total] = await Promise.all([
                delegate.findMany({
                    where: prismaWhere,
                    ...prismaRange,
                }),
                delegate.count({ where: prismaWhere })
            ]);
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
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resource = (await params).resource;
    const body = await request.json();

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        const data = await delegate.create({
            data: body
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error creating ${resource}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
