import { getSession } from '@/lib/servers/sessions';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { statement } from '@/auth/user-permissions';

type Statement = typeof statement;
type PermissionInput = {
  [K in keyof Statement]?: readonly (Statement[K] extends readonly string[] ? Statement[K][number] : never)[];
};

export async function validateSessionAndPermission(
  permission: PermissionInput
) {
  const session = await getSession();

  if (!session || !session.user.role) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const hasPermission = await auth.api.userHasPermission({
    body: {
      role: session.user.role,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      permission,
    },
  });

  if (!hasPermission.success) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { success: true, session };
}