import { NextApiResponse } from 'next';
import { getSession } from './sessions';
import { Session, User } from 'better-auth';
import { NextRequest, NextResponse } from 'next/server';

export type SessionRequest = {
  session: Session;
  user: User;
};

export type WithAuthRequest = NextRequest & { session: SessionRequest };

export function withAuth<T extends NextApiResponse>(
  handler: (req: WithAuthRequest, params: T) => Promise<any>
) {
  return async (req: NextRequest, params: T) => {
    try {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!session.user.role) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const withAuthRequest = {
        ...req,
        session,
      } as unknown as WithAuthRequest;

      return handler(withAuthRequest, params);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
