import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../../prisma/generated/client';
import { z } from 'zod';
import {
  admin as adminPlugin,
  organization,
  openAPI,
  bearer,
  username,
} from 'better-auth/plugins';

import { admin, ac } from '@/auth/user-permissions';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: false,
        validator: {
          input: z.string().optional(),
        },
      },
      address: {
        type: 'string',
        required: false,
        validator: {
          input: z.string().optional(),
        },
      },
      postalCode: {
        type: 'string',
        required: false,
        validator: {
          input: z
            .string()
            .regex(/^\d{5}$/)
            .optional(),
        },
      },
      status: {
        type: ['pending', 'active', 'suspended', 'banned'],
        required: true,
        defaultValue: 'active',
        input: false,
        validator: {
          input: z.enum(['pending', 'active', 'suspended', 'banned']),
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: 'trace_auth',
  },
  plugins: [
    username(),
    adminPlugin({
      ac,
      roles: {
        admin,
      },
    }),
    organization({
      allowUserToCreateOrganization: () => {
        return false;
        // return user.role === 'admin';
      },
    }),
    openAPI(),
    bearer(),
  ],
});
