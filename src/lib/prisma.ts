import "server-only";

import { PrismaClient } from '../../prisma/generated/client';

export const prisma = new PrismaClient();

export default prisma;
