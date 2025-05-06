import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { z } from 'zod';
import {
  admin as adminPlugin,
  organization,
  openAPI,
  bearer,
  username,
} from 'better-auth/plugins';

import { admin, ac, user } from '@/auth/user-permissions';
import prisma from "./prisma";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  trustedOrigins: [process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'],
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
      state: {
        type: 'string',
        required: false,
        validator: {
          input: z.string().optional(),
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
  plugins: [
    username(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
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
