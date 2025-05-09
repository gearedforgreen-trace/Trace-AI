import { getSession } from '@/lib/servers/sessions';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function validateSessionAndPermission(
    permission: Record<string, string[]>
) {
    const session = await getSession();

    if (!session || !session.user.role) {
        return {
            success: false,
            response: NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            ),
        };
    }

    const hasPermission = await auth.api.userHasPermission({
        body: {
            role: session.user.role,
            permission,
        },
    });

    if (!hasPermission.success) {
        return {
            success: false,
            response: NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            ),
        };
    }

    return { success: true, session };
}