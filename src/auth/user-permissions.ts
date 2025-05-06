import { defaultStatements as adminDefaults } from 'better-auth/plugins/admin/access';
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements as organizationDefaults } from 'better-auth/plugins/organization/access';

export const statement = {
  user: adminDefaults.user,
  session: adminDefaults.session,
  organization: [...organizationDefaults.organization, 'list'],
  member: [...organizationDefaults.member, 'list'],
  invitation: [...organizationDefaults.invitation, 'list'],
  team: [...organizationDefaults.team, 'list'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  user: [
    'create',
    'list',
    'set-role',
    'ban',
    'impersonate',
    'delete',
    'set-password',
  ],
  session: ['list', 'revoke', 'delete'],
});

export const user = ac.newRole({
  user: [],
  session: [],
});
