import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromSession } from "@/lib/auth/admin-auth";

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

// GET /api/admin/ra/[resource]/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string, id: string }> }
) {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const resource = p.resource;
    const id = p.id;

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        let whereClause: any = { id };

        // Handle models that don't use 'id' as primary key if necessary
        // Assume 'id' for general Prisma conventions

        const data = await delegate.findUnique({
            where: whereClause
        });

        if (!data) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error querying ${resource}/${id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/admin/ra/[resource]/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string, id: string }> }
) {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const resource = p.resource;
    const id = p.id;
    const body = await request.json();

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        // Remove ID from body if present to prevent updating primary keys
        const { id: _id, ...updateData } = body;

        const data = await delegate.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error updating ${resource}/${id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/ra/[resource]/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string, id: string }> }
) {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const resource = p.resource;
    const id = p.id;

    try {
        const modelName = resourceToModel[resource] || (resource as keyof typeof prisma);
        const delegate = prisma[modelName] as any;

        if (!delegate) {
            return NextResponse.json({ error: `Resource '${resource}' (mapped to Prisma '${String(modelName)}') not found` }, { status: 404 });
        }

        const data = await delegate.delete({
            where: { id }
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error deleting ${resource}/${id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
