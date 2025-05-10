import { PrismaClient, Prisma } from './generated/client';

const prisma = new PrismaClient();

prisma.$use(
  async (params: Prisma.MiddlewareParams, next: (arg0: any) => any) => {
    if (params.model === 'RecycleHistory' && params.action === 'create') {
      const { userId, points } = params.args.data;

      await prisma.userTotalPoint.upsert({
        where: { userId },
        update: { totalPoints: { increment: points } },
        create: { userId, totalPoints: points },
      });
    }

    if (params.model === 'RedeemHistory' && params.action === 'create') {
      const { userId, points } = params.args.data;
      await prisma.userTotalPoint.upsert({
        where: { userId },
        update: { totalPoints: { decrement: points } },
        create: { userId, totalPoints: points },
      });
    }
    return next(params);
  }
);

export default prisma;
