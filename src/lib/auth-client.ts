import {
  organizationClient,
  adminClient,
  inferAdditionalFields,
  usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { ac, admin, user } from '@/auth/user-permissions';
import { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    organizationClient(),
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
  ],
});
